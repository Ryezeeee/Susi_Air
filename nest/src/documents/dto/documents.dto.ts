export type DocumentStatus = 'expired' | 'soon' | 'safe';

export class PilotDocumentDto {
  id: string;
  label: string;
  expiryDate: string;
  daysRemaining: number;
  status: DocumentStatus;
}

export class DocumentsResponseDto {
  today: string;
  warningDays: number;
  documents: PilotDocumentDto[];
}
