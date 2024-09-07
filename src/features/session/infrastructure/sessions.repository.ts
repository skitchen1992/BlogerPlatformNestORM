import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Session } from '@features/session/domain/session.entity';
import { NewSessionDto } from '@features/session/api/dto/new-session.dto';

@Injectable()
export class SessionsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  public async getSessionByDeviceId(deviceId: string): Promise<Session | null> {
    try {
      const devise = await this.dataSource.query(
        `
      SELECT * FROM sessions s
      WHERE s.device_id = $1
    `,
        [deviceId],
      );

      if (!devise.at(0)) {
        return null;
      }

      return devise.at(0);
    } catch (e) {
      return null;
    }
  }

  public async create(newSession: NewSessionDto): Promise<string> {
    try {
      const result = await this.dataSource.query(
        `
      INSERT INTO sessions (user_id, ip, title, last_active_date, token_issue_date, token_expiration_date, device_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `,
        [
          newSession.userId,
          newSession.ip,
          newSession.title,
          newSession.lastActiveDate,
          newSession.tokenIssueDate,
          newSession.tokenExpirationDate,
          newSession.deviceId,
        ],
      );

      return result[0].id;
    } catch (e) {
      console.error('Error inserting user into database', {
        error: e,
      });
      return '';
    }
  }

  public async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `
        DELETE FROM sessions
        WHERE device_id = $1;
    `,
        [deviceId],
      );
      return result.at(1) === 1;
    } catch (e) {
      return false;
    }
  }

  async deleteSessionListByUserId(userId: string): Promise<boolean> {
    try {
      const deleteResult = await this.dataSource.query(
        `
  DELETE FROM sessions
  WHERE user_id = $1
  `,
        [userId],
      );

      return Boolean(deleteResult.at(1));
    } catch (e) {
      return false;
    }
  }

  public async updateDatesByDeviceId(
    deviceId: string,
    tokenExpirationDate: Date,
    lastActiveDate: Date,
  ): Promise<boolean> {
    try {
      const updateResult = await this.dataSource.query(
        `
      UPDATE sessions
      SET token_expiration_date = $1, 
            last_active_date = $2
      WHERE device_id = $3
      RETURNING id;
      `,
        [tokenExpirationDate, lastActiveDate, deviceId],
      );

      return Boolean(updateResult.at(1));
    } catch (e) {
      return false;
    }
  }
}
