import { Injectable } from '@nestjs/common';
import { PILOT_ID } from '../auth/auth.service';
import { DataService } from '../data/data.service';
import { PilotProfileDto } from './dto/pilot-profile.dto';

@Injectable()
export class PilotService {
  constructor(private readonly data: DataService) {}

  getProfile(): PilotProfileDto {
    const { name, totalFlightHours } = this.data.flightHours.pilot;
    return {
      id: PILOT_ID,
      name,
      totalFlightHours,
      avatarUrl:
        process.env.PILOT_AVATAR_URL ??
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0E2138&color=ffffff&size=128&bold=true`,
    };
  }
}
