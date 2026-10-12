import { IsIn, IsISO8601, Matches } from 'class-validator';
import { RANGE_KEYS, RangeKey } from '../../data/data.types';

const DATE_MSG = 'must be a date in YYYY-MM-DD format';

export class FlightHoursQueryDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: `from ${DATE_MSG}` })
  @IsISO8601({ strict: true }, { message: `from ${DATE_MSG}` })
  from: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: `to ${DATE_MSG}` })
  @IsISO8601({ strict: true }, { message: `to ${DATE_MSG}` })
  to: string;
}

export class SummaryQueryDto {
  @IsIn(RANGE_KEYS, { message: `range must be one of: ${RANGE_KEYS.join(', ')}` })
  range: RangeKey = '1w';
}

export interface DailyHoursDto {
  date: string;
  hours: number;
  /** false when the date is outside the logged dataset (hours reported as 0). */
  hasData: boolean;
}

export interface FlightHoursResponseDto {
  from: string;
  to: string;
  totalHours: number;
  days: DailyHoursDto[];
}

export type LimitStatus = 'ok' | 'warning' | 'over';

export interface LimitCardDto {
  key: 'daily' | 'weekly' | 'monthly' | 'annual';
  label: string;
  windowDays: number;
  hours: number;
  limit: number;
  remaining: number;
  percent: number;
  status: LimitStatus;
}

export interface SeriesPointDto {
  date: string;
  /** Rolling sum of the window ending on this date. */
  value: number;
  /** Hours logged on that single day (useful for tooltips). */
  dayHours: number;
  isToday: boolean;
  /** Date is after "today": the value includes planned hours, not flown hours. */
  isProjected: boolean;
  /** Part of the window falls before the first logged day, so the sum may be understated. */
  isPartialWindow: boolean;
  overLimit: boolean;
}

export interface SummaryResponseDto {
  range: RangeKey;
  today: string;
  windowDays: number;
  limit: number;
  yMax: number;
  cards: LimitCardDto[];
  series: SeriesPointDto[];
}
