import { Injectable } from '@nestjs/common';
import { AllDevicesOutputDtoMapper } from '@features/session/api/dto/output/allDevices.output.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Session } from '@features/session/domain/session.entity';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async getDeviceListByUserId(userId: string) {
    const sessions = await this.sessionRepository.find({
      where: {
        user_id: userId,
        token_expiration_date: MoreThan(new Date()),
      },
    });

    return sessions.map((session) => AllDevicesOutputDtoMapper(session));
  }
}
