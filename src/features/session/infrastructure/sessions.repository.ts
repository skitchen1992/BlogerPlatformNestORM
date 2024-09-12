import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '@features/session/domain/session.entity';
import { NewSessionDto } from '@features/session/api/dto/new-session.dto';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  public async getSessionByDeviceId(deviceId: string): Promise<Session | null> {
    try {
      return await this.sessionRepository.findOne({
        where: { device_id: deviceId },
      });
    } catch (e) {
      console.error('Error getSessionByDeviceId', {
        error: e,
      });
      return null;
    }
  }

  public async create(newSession: NewSessionDto): Promise<string> {
    try {
      const session = this.sessionRepository.create({
        user_id: newSession.userId,
        ip: newSession.ip,
        title: newSession.title,
        last_active_date: newSession.lastActiveDate,
        token_issue_date: newSession.tokenIssueDate,
        token_expiration_date: newSession.tokenExpirationDate,
        device_id: newSession.deviceId,
      });

      const result = await this.sessionRepository.save(session);
      return result.id;
    } catch (e) {
      console.error('Error inserting user into database', {
        error: e,
      });
      return '';
    }
  }

  public async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
    try {
      const result = await this.sessionRepository.delete({
        device_id: deviceId,
      });
      return result.affected === 1;
    } catch (e) {
      return false;
    }
  }

  async deleteSessionListByUserId(userId: string): Promise<boolean> {
    try {
      const deleteResult = await this.sessionRepository.delete({
        user_id: userId,
      });
      return deleteResult.affected === 1;
    } catch (e) {
      console.error('Error deleting sessions by userId', {
        error: e,
      });
      return false;
    }
  }

  public async updateDatesByDeviceId(
    deviceId: string,
    tokenExpirationDate: Date,
    lastActiveDate: Date,
  ): Promise<boolean> {
    try {
      const updateResult = await this.sessionRepository.update(
        { device_id: deviceId },
        {
          token_expiration_date: tokenExpirationDate,
          last_active_date: lastActiveDate,
        },
      );

      return updateResult.affected === 1;
    } catch (e) {
      console.error('Error updating dates by deviceId', {
        error: e,
      });
      return false;
    }
  }
}
