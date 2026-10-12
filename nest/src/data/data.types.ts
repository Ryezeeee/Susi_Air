export type RangeKey = '1w' | '1m' | '3m' | '6m' | '1y';
export const RANGE_KEYS: RangeKey[] = ['1w', '1m', '3m', '6m', '1y'];

export interface FlightHoursFile {
  pilot: { name: string; totalFlightHours: number };
  limits: { daily: number; weekly: number; monthly: number; annual: number };
  chartBounds: Record<RangeKey, { limit: number; max: number; windowDays: number; displayRangeDays: number }>;
  flightHours: { date: string; hours: number }[];
}

export interface DocumentsFile {
  today?: string;
  thresholds: { warningDays: number };
  documents: { id: string; label: string; expiryDate: string }[];
}

export interface ScheduleEntry {
  id: string;
  duty_date: string;
  status: 1 | 2;
  base_name: string;
  base_color: string;
  duty_type: string;
  count_schedules: number;
  count_logbooks: number;
}

export interface SchedulesFile {
  legend: { code: string; label: string; color: string }[];
  schedules: ScheduleEntry[];
}
