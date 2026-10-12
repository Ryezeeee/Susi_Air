import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { ClockService } from '../common/clock/clock.service';
import { addDays, diffDays, fromEpochDay, round1, toEpochDay } from '../common/utils/date.util';
import { DataService } from '../data/data.service';
import { RangeKey } from '../data/data.types';
import {
  FlightHoursResponseDto,
  LimitCardDto,
  LimitStatus,
  SeriesPointDto,
  SummaryResponseDto,
} from './dto/flight-hours.dto';

/** Max span for /flight-hours so one request can't ask for decades of empty days. */
export const MAX_RANGE_DAYS = 400;
/** Card turns amber at this share of the limit. */
export const WARNING_RATIO = 0.8;

interface RollingSum {
  value: number;
  partial: boolean;
}

/**
 * Flight-hour queries and the rolling-sum math.
 *
 * Data model: the JSON is turned into a dense, gap-free array of daily hours
 * (missing dates count as 0) plus a prefix-sum array. Any window sum is then
 * prefix[end] - prefix[start], i.e. O(1) per point, regardless of window size.
 *
 * Edge-case decisions (also in the README):
 *  - Days before the first logged date count as 0, and the point is flagged
 *    `isPartialWindow` so the UI can say the figure may be understated.
 *  - Dates after "today" are projections: logged entries after today are
 *    treated as planned hours, so the chart shows where the window will stand
 *    if the roster is flown. Dates after the dataset ends add 0 (nothing planned).
 *  - Limit cards use flown hours only (up to and including today).
 */
@Injectable()
export class FlightHoursService implements OnModuleInit {
  private startDay = 0; // epoch day of the first entry
  private daily: number[] = []; // hours per day, index 0 = startDay
  private prefix: number[] = [0]; // prefix[i] = sum of daily[0..i-1]

  constructor(
    private readonly data: DataService,
    private readonly clock: ClockService,
  ) {}

  onModuleInit(): void {
    const entries = this.data.flightHours.flightHours;
    if (entries.length === 0) return;

    this.startDay = toEpochDay(entries[0].date);
    const endDay = toEpochDay(entries[entries.length - 1].date);
    this.daily = new Array(endDay - this.startDay + 1).fill(0);
    for (const { date, hours } of entries) {
      this.daily[toEpochDay(date) - this.startDay] += Number(hours) || 0;
    }
    this.prefix = [0];
    for (const h of this.daily) this.prefix.push(this.prefix[this.prefix.length - 1] + h);
  }

  // ---------- GET /flight-hours ----------

  getDailyHours(from: string, to: string): FlightHoursResponseDto {
    const span = diffDays(to, from);
    if (span < 0) {
      throw new BadRequestException({ code: 'INVALID_RANGE', message: '`from` must be on or before `to`.' });
    }
    if (span + 1 > MAX_RANGE_DAYS) {
      throw new BadRequestException({
        code: 'RANGE_TOO_LARGE',
        message: `Date range can cover at most ${MAX_RANGE_DAYS} days.`,
      });
    }

    const days = [];
    let total = 0;
    for (let d = toEpochDay(from); d <= toEpochDay(to); d++) {
      const idx = d - this.startDay;
      const hasData = idx >= 0 && idx < this.daily.length;
      const hours = hasData ? round1(this.daily[idx]) : 0;
      total += hours;
      days.push({ date: fromEpochDay(d), hours, hasData });
    }
    return { from, to, totalHours: round1(total), days };
  }

  // ---------- GET /flight-hours/summary ----------

  getSummary(range: RangeKey): SummaryResponseDto {
    const bounds = this.data.flightHours.chartBounds[range];
    const today = this.clock.today();
    const half = bounds.displayRangeDays; // 7 days either side, today centred

    const series: SeriesPointDto[] = [];
    for (let offset = -half; offset <= half; offset++) {
      const date = addDays(today, offset);
      const { value, partial } = this.computeRollingSum(date, bounds.windowDays);
      series.push({
        date,
        value,
        dayHours: round1(this.hoursOn(date)),
        isToday: offset === 0,
        isProjected: offset > 0,
        isPartialWindow: partial,
        overLimit: value > bounds.limit,
      });
    }

    return {
      range,
      today,
      windowDays: bounds.windowDays,
      limit: bounds.limit,
      yMax: bounds.max,
      cards: this.getLimitCards(),
      series,
    };
  }

  getLimitCards(): LimitCardDto[] {
    const limits = this.data.flightHours.limits;
    const today = this.clock.today();
    const defs: Pick<LimitCardDto, 'key' | 'label' | 'windowDays' | 'limit'>[] = [
      { key: 'daily', label: 'Daily', windowDays: 1, limit: limits.daily },
      { key: 'weekly', label: 'Weekly', windowDays: 7, limit: limits.weekly },
      { key: 'monthly', label: 'Monthly', windowDays: 30, limit: limits.monthly },
      { key: 'annual', label: 'Annual', windowDays: 365, limit: limits.annual },
    ];
    return defs.map((def) => {
      const hours = this.computeRollingSum(today, def.windowDays).value;
      const ratio = def.limit > 0 ? hours / def.limit : 0;
      const status: LimitStatus = ratio > 1 ? 'over' : ratio >= WARNING_RATIO ? 'warning' : 'ok';
      return {
        ...def,
        hours,
        remaining: round1(Math.max(def.limit - hours, 0)),
        percent: Math.round(ratio * 1000) / 10,
        status,
      };
    });
  }

  /**
   * Rolling sum of flight hours for the `windowDays`-day window that ends on
   * `windowEnd` (inclusive). Zero-hour and missing days contribute 0.
   */
  computeRollingSum(windowEnd: string, windowDays: number): RollingSum {
    const end = toEpochDay(windowEnd) - this.startDay; // index of last day in window
    const start = end - windowDays + 1; // index of first day in window
    const partial = start < 0;

    // Clamp to the stored range; anything outside it is 0 by definition.
    const lo = Math.max(start, 0);
    const hi = Math.min(end, this.daily.length - 1);
    const value = hi < lo ? 0 : this.prefix[hi + 1] - this.prefix[lo];
    return { value: round1(value), partial };
  }

  private hoursOn(date: string): number {
    const idx = toEpochDay(date) - this.startDay;
    return idx >= 0 && idx < this.daily.length ? this.daily[idx] : 0;
  }
}
