import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { Public } from './common/decorators/public.decorator';
import { DataModule } from './data/data.module';
import { DocumentsModule } from './documents/documents.module';
import { FlightHoursModule } from './flight-hours/flight-hours.module';
import { PilotModule } from './pilot/pilot.module';
import { SchedulesModule } from './schedules/schedules.module';

/** Unauthenticated liveness probe for the hosting platform. */
@Controller()
class HealthController {
  @Public()
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DataModule,
    AuthModule,
    PilotModule,
    FlightHoursModule,
    DocumentsModule,
    SchedulesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
