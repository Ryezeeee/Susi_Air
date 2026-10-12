import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DocumentsFile, FlightHoursFile, SchedulesFile } from './data.types';

/**
 * Loads the three provided JSON files once, when the service boots,
 * and keeps them in memory. No database is needed for this test.
 */
@Injectable()
export class DataService implements OnModuleInit {
  private readonly logger = new Logger(DataService.name);
  private readonly dataDir = process.env.DATA_DIR ?? join(process.cwd(), 'data');

  flightHours!: FlightHoursFile;
  documents!: DocumentsFile;
  schedules!: SchedulesFile;

  onModuleInit(): void {
    this.flightHours = this.load<FlightHoursFile>('mock-flight-hours.json');
    this.documents = this.load<DocumentsFile>('mock-documents.json');
    this.schedules = this.load<SchedulesFile>('mock-schedules.json');

    // Sort once so lookups and prefix sums can rely on date order.
    this.flightHours.flightHours.sort((a, b) => a.date.localeCompare(b.date));
    this.schedules.schedules.sort((a, b) => a.duty_date.localeCompare(b.duty_date));

    this.logger.log(
      `Seeded ${this.flightHours.flightHours.length} flight-hour days, ` +
        `${this.documents.documents.length} documents, ${this.schedules.schedules.length} schedule entries`,
    );
  }

  private load<T>(file: string): T {
    return JSON.parse(readFileSync(join(this.dataDir, file), 'utf-8')) as T;
  }
}
