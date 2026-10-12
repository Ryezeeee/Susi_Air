import { Controller, Get, Query } from '@nestjs/common';
import {
  FlightHoursQueryDto,
  FlightHoursResponseDto,
  SummaryQueryDto,
  SummaryResponseDto,
} from './dto/flight-hours.dto';
import { FlightHoursService } from './flight-hours.service';

@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly service: FlightHoursService) {}

  @Get()
  list(@Query() q: FlightHoursQueryDto): FlightHoursResponseDto {
    return this.service.getDailyHours(q.from, q.to);
  }

  @Get('summary')
  summary(@Query() q: SummaryQueryDto): SummaryResponseDto {
    return this.service.getSummary(q.range);
  }
}
