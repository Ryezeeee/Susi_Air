import { Global, Module } from '@nestjs/common';
import { ClockService } from '../common/clock/clock.service';
import { DataService } from './data.service';

@Global()
@Module({
  providers: [DataService, ClockService],
  exports: [DataService, ClockService],
})
export class DataModule {}
