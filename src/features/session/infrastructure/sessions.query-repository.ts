import { Injectable } from '@nestjs/common';
import { AllDevicesOutputDtoMapper } from '@features/session/api/dto/output/allDevices.output.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Session } from '@features/session/domain/session.entity';

@Injectable()
export class SessionsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getDeviceListByUserId(userId: string) {
    const sessions: Session[] = await this.dataSource.query(
      `
      SELECT * FROM sessions s
      WHERE s.user_id = $1
            AND s.token_expiration_date > $2
    `,
      [userId, new Date()],
    );

    return sessions.map((session) => AllDevicesOutputDtoMapper(session));
  }
}
