import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class SchedulesQueryDto {
  @Type(() => Number)
  @IsInt({ message: 'year must be an integer' })
  @Min(2000)
  @Max(2100)
  year: number;

  @Type(() => Number)
  @IsInt({ message: 'month must be an integer' })
  @Min(1, { message: 'month must be between 1 and 12' })
  @Max(12, { message: 'month must be between 1 and 12' })
  month: number;
}

export interface ScheduleDayDto {
  id: string;
  dutyDate: string;
  status: 1 | 2;
  baseName: string;
  baseColor: string;
  dutyType: string;
  countSchedules: number;
  countLogbooks: number;
  /** count_schedules - count_logbooks, never below 0. */
  remaining: number;
  /** true when every planned duty is logged -> show a tick. */
  isComplete: boolean;
}

export interface LegendItemDto {
  code: string;
  label: string;
  color: string;
}

export interface SchedulesResponseDto {
  year: number;
  month: number;
  today: string;
  legend: LegendItemDto[];
  entries: ScheduleDayDto[];
}
