import { Injectable } from '@nestjs/common';
import { ClockService } from '../common/clock/clock.service';
import { DataService } from '../data/data.service';
import { SchedulesResponseDto } from './dto/schedules.dto';

@Injectable()
export class SchedulesService {
  constructor(
    private readonly data: DataService,
    private readonly clock: ClockService,
  ) {}

  /** Entries for one month. A month with no data returns an empty list, not a 404. */
  forMonth(year: number, month: number): SchedulesResponseDto {
    const prefix = `${year}-${String(month).padStart(2, '0')}-`;
    const entries = this.data.schedules.schedules
      .filter((s) => s.duty_date.startsWith(prefix))
      .map((s) => ({
        id: s.id,
        dutyDate: s.duty_date,
        status: s.status,
        baseName: s.base_name,
        baseColor: s.base_color,
        dutyType: s.duty_type,
        countSchedules: s.count_schedules,
        countLogbooks: s.count_logbooks,
        remaining: Math.max(s.count_schedules - s.count_logbooks, 0),
        isComplete: s.count_logbooks >= s.count_schedules,
      }));

    return { year, month, today: this.clock.today(), legend: this.data.schedules.legend, entries };
  }
}
