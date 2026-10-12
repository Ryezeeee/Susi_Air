import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isIsoDate } from '../utils/date.util';

export const DEFAULT_TODAY = '2026-05-15';

/**
 * Single source of truth for "today".
 * The brief asks us not to use new Date() for today, so it comes from the
 * APP_TODAY env var (default 2026-05-15) and every service asks this class.
 */
@Injectable()
export class ClockService {
  private readonly logger = new Logger(ClockService.name);
  private readonly todayValue: string;

  constructor(config: ConfigService) {
    const configured = config.get<string>('APP_TODAY') ?? DEFAULT_TODAY;
    if (!isIsoDate(configured)) {
      this.logger.warn(`APP_TODAY "${configured}" is not a valid YYYY-MM-DD date, using ${DEFAULT_TODAY}`);
      this.todayValue = DEFAULT_TODAY;
    } else {
      this.todayValue = configured;
    }
  }

  today(): string {
    return this.todayValue;
  }
}
