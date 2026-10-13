import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DocumentsFile, FlightHoursFile, SchedulesFile } from './data.types';
// Imported (not read with fs) so the JSON is bundled with the code. This keeps the
// app working on serverless hosts such as Vercel, where only bundled files exist.
import documentsJson from './mock/mock-documents.json';
import flightHoursJson from './mock/mock-flight-hours.json';
import schedulesJson from './mock/mock-schedules.json';

/**
 * Holds the three provided JSON files in memory. No database is needed for this test.
 */
@Injectable()
export class DataService implements OnModuleInit {
  private readonly logger = new Logger(DataService.name);

  flightHours!: FlightHoursFile;
  documents!: DocumentsFile;
  schedules!: SchedulesFile;

  onModuleInit(): void {
    // structuredClone so sorting below never mutates the imported module objects.
    this.flightHours = structuredClone(flightHoursJson) as FlightHoursFile;
    this.documents = structuredClone(documentsJson) as DocumentsFile;
    this.schedules = structuredClone(schedulesJson) as SchedulesFile;

    // Sort once so lookups and prefix sums can rely on date order.
    this.flightHours.flightHours.sort((a, b) => a.date.localeCompare(b.date));
    this.schedules.schedules.sort((a, b) => a.duty_date.localeCompare(b.duty_date));

    this.logger.log(
      `Seeded ${this.flightHours.flightHours.length} flight-hour days, ` +
        `${this.documents.documents.length} documents, ${this.schedules.schedules.length} schedule entries`,
    );
  }
}
