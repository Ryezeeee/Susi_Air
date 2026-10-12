import { Controller, Get } from '@nestjs/common';
import { PilotProfileDto } from './dto/pilot-profile.dto';
import { PilotService } from './pilot.service';

@Controller('pilot')
export class PilotController {
  constructor(private readonly pilot: PilotService) {}

  @Get('me')
  me(): PilotProfileDto {
    return this.pilot.getProfile();
  }
}
