// Response shapes returned by the NestJS API.

export type RangeKey = '1w' | '1m' | '3m' | '6m' | '1y';
export const RANGE_KEYS: RangeKey[] = ['1w', '1m', '3m', '6m', '1y'];

export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string;
  details?: string[];
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}

export interface PilotProfile {
  id: string;
  name: string;
  totalFlightHours: number;
  avatarUrl: string;
}

export type LimitStatus = 'ok' | 'warning' | 'over';

export interface LimitCard {
  key: 'daily' | 'weekly' | 'monthly' | 'annual';
  label: string;
  windowDays: number;
  hours: number;
  limit: number;
  remaining: number;
  percent: number;
  status: LimitStatus;
}

export interface SeriesPoint {
  date: string;
  value: number;
  dayHours: number;
  isToday: boolean;
  isProjected: boolean;
  isPartialWindow: boolean;
  overLimit: boolean;
}

export interface FlightHoursSummary {
  range: RangeKey;
  today: string;
  windowDays: number;
  limit: number;
  yMax: number;
  cards: LimitCard[];
  series: SeriesPoint[];
}

export type DocumentStatus = 'expired' | 'soon' | 'safe';

export interface PilotDocument {
  id: string;
  label: string;
  expiryDate: string;
  daysRemaining: number;
  status: DocumentStatus;
}

export interface DocumentsResponse {
  today: string;
  warningDays: number;
  documents: PilotDocument[];
}

export interface ScheduleDay {
  id: string;
  dutyDate: string;
  status: 1 | 2;
  baseName: string;
  baseColor: string;
  dutyType: string;
  countSchedules: number;
  countLogbooks: number;
  remaining: number;
  isComplete: boolean;
}

export interface LegendItem {
  code: string;
  label: string;
  color: string;
}

export interface SchedulesResponse {
  year: number;
  month: number;
  today: string;
  legend: LegendItem[];
  entries: ScheduleDay[];
}
