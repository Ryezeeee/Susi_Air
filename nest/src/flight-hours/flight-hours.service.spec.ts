import { ClockService } from '../common/clock/clock.service';
import { DataService } from '../data/data.service';
import { FlightHoursService } from './flight-hours.service';

function makeService(hours: { date: string; hours: number }[], today = '2026-01-10') {
  const data = {
    flightHours: {
      pilot: { name: 'Test', totalFlightHours: 0 },
      limits: { daily: 8, weekly: 40, monthly: 100, annual: 1050 },
      chartBounds: { '1w': { limit: 40, max: 45, windowDays: 7, displayRangeDays: 7 } },
      flightHours: hours,
    },
  } as unknown as DataService;
  const clock = { today: () => today } as ClockService;
  const svc = new FlightHoursService(data, clock);
  svc.onModuleInit();
  return svc;
}

describe('FlightHoursService.computeRollingSum', () => {
  const days = Array.from({ length: 10 }, (_, i) => ({
    date: `2026-01-${String(i + 1).padStart(2, '0')}`,
    hours: i + 1, // 1..10
  }));

  it('sums the window ending on the given date, inclusive', () => {
    const svc = makeService(days);
    // Jan 4..10 -> 4+5+6+7+8+9+10 = 49
    expect(svc.computeRollingSum('2026-01-10', 7)).toEqual({ value: 49, partial: false });
  });

  it('treats days before the dataset as 0 and flags the window as partial', () => {
    const svc = makeService(days);
    // Window Dec 28..Jan 3 -> only 1+2+3
    expect(svc.computeRollingSum('2026-01-03', 7)).toEqual({ value: 6, partial: true });
  });

  it('treats days after the dataset as 0', () => {
    const svc = makeService(days);
    // Window Jan 8..14 -> 8+9+10
    expect(svc.computeRollingSum('2026-01-14', 7).value).toBe(27);
  });

  it('counts gaps in the data as zero-hour days instead of skipping them', () => {
    const svc = makeService([
      { date: '2026-01-01', hours: 5 },
      { date: '2026-01-05', hours: 5 },
    ]);
    // A 3-day window ending Jan 5 must be Jan 3..5, not "the last 3 entries"
    expect(svc.computeRollingSum('2026-01-05', 3).value).toBe(5);
  });

  it('builds a 15-point series centred on today and flags future points as projected', () => {
    const svc = makeService(days, '2026-01-05');
    const { series } = svc.getSummary('1w');
    expect(series).toHaveLength(15);
    expect(series[7]).toMatchObject({ date: '2026-01-05', isToday: true, isProjected: false });
    expect(series[8].isProjected).toBe(true);
    expect(series[0].date).toBe('2025-12-29');
  });
});
