import { Controller, Get, Query } from '@nestjs/common';
import { SchedulesQueryDto, SchedulesResponseDto } from './dto/schedules.dto';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly service: SchedulesService) {}

  @Get()
  list(@Query() q: SchedulesQueryDto): SchedulesResponseDto {
    return this.service.forMonth(q.year, q.month);
  }
}
