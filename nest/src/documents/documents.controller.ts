import { Controller, Get } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsResponseDto } from './dto/documents.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get()
  list(): DocumentsResponseDto {
    return this.service.list();
  }
}
