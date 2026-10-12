import { Injectable } from '@nestjs/common';
import { ClockService } from '../common/clock/clock.service';
import { diffDays } from '../common/utils/date.util';
import { DataService } from '../data/data.service';
import { DocumentStatus, DocumentsResponseDto } from './dto/documents.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly data: DataService,
    private readonly clock: ClockService,
  ) {}

  /**
   * Badge rule from mock-documents.json:
   *   daysRemaining <= 0            -> expired (red)
   *   0 < daysRemaining <= warning  -> soon    (amber)
   *   otherwise                     -> safe    (green)
   * "today" is the app-wide clock (APP_TODAY), not the `today` field in the
   * documents file, so every screen agrees on one date.
   */
  list(): DocumentsResponseDto {
    const today = this.clock.today();
    const warningDays = this.data.documents.thresholds.warningDays;
    const order: Record<DocumentStatus, number> = { expired: 0, soon: 1, safe: 2 };

    const documents = this.data.documents.documents
      .map((doc) => {
        const daysRemaining = diffDays(doc.expiryDate, today);
        const status: DocumentStatus =
          daysRemaining <= 0 ? 'expired' : daysRemaining <= warningDays ? 'soon' : 'safe';
        return { ...doc, daysRemaining, status };
      })
      // Most urgent first: that's what a pilot needs to act on.
      .sort((a, b) => order[a.status] - order[b.status] || a.daysRemaining - b.daysRemaining);

    return { today, warningDays, documents };
  }
}
