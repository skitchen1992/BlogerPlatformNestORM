import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EmailConfirmation } from '@features/users/domain/emailConfirmation.entity';
import { RecoveryCodeDto } from '@features/auth/api/dto/recovery-code.dto';
import { UserJoined } from '@features/users/api/dto/User-joined.dto';
import { NewUserDto } from '@features/users/api/dto/new-user.dto';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  public async getUserById(userId: string): Promise<UserJoined | null> {
    try {
      const user = await this.dataSource.query(
        `
    SELECT
        u.id,
        u.login,
        u.password,
        u.email,
        u.created_at,
        rc.is_confirmed AS recovery_is_confirmed,
        rc.confirmation_code AS recovery_confirmation_code,
        ec.is_confirmed AS email_is_confirmed,
        ec.confirmation_code AS email_confirmation_code,
        ec.expiration_date AS email_expiration_date
    FROM
        users u
    LEFT JOIN
        email_confirmations ec ON u.id = ec.user_id
    LEFT JOIN
        recovery_code rc ON u.id = rc.user_id
     WHERE u.id = $1
    `,
        [
          userId, //$1
        ],
      );

      if (!user.at(0)) {
        return null;
      }

      return user.at(0);
    } catch (e) {
      return null;
    }
  }

  public async create(
    newUser: NewUserDto,
    emailConfirmation?: EmailConfirmation,
  ): Promise<string> {
    try {
      const result = await this.dataSource.query(
        `
      INSERT INTO users (login, password, email)
      VALUES ($1, $2, $3)
      RETURNING id;
    `,
        [newUser.login, newUser.password, newUser.email],
      );

      const userId = result[0].id;

      if (emailConfirmation) {
        await this.dataSource.query(
          `
      INSERT INTO email_confirmations (user_id, is_confirmed, confirmation_code, expiration_date)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `,
          [
            userId,
            emailConfirmation.is_confirmed,
            emailConfirmation.confirmation_code,
            emailConfirmation.expiration_date,
          ],
        );
      }

      return userId;
    } catch (e) {
      console.error('Error inserting user into database', {
        error: e,
      });
      return '';
    }
  }

  public async delete(userId: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `
      DELETE FROM users 
      WHERE id = $1
      RETURNING *;  -- To ensure you get feedback on the operation
      `,
        [userId],
      );

      return Boolean(result.at(1));
    } catch (e) {
      console.error('Error during deleteBlogById operation:', e);
      return false;
    }
  }

  public async updatePassword(
    userId: string,
    password: string,
  ): Promise<boolean> {
    try {
      const updateResult = await this.dataSource.query(
        `
      UPDATE users
      SET password = $1
      WHERE id = $2
      RETURNING id;
      `,
        [password, userId],
      );

      return Boolean(updateResult.at(1));
    } catch (e) {
      return false;
    }
  }

  public async insertRecoveryCode(
    userId: string,
    recoveryCodeDto: RecoveryCodeDto,
  ): Promise<boolean> {
    try {
      // Попытка обновления записи с указанным user_id
      const updateResult = await this.dataSource.query(
        `
      UPDATE recovery_code
      SET confirmation_code = $1, is_confirmed = $2
      WHERE user_id = $3
      RETURNING id;
      `,
        [recoveryCodeDto.confirmationCode, recoveryCodeDto.isConfirmed, userId],
      );

      // Если запись обновлена, возвращаем true
      if (Boolean(updateResult.at(1))) {
        return true;
      }

      // Если запись не была найдена и обновлена, вставляем новую запись
      const insertResult = await this.dataSource.query(
        `
      INSERT INTO recovery_code (user_id, confirmation_code, is_confirmed)
      VALUES ($1, $2, $3)
      RETURNING id;
      `,
        [userId, recoveryCodeDto.confirmationCode, recoveryCodeDto.isConfirmed],
      );

      return Boolean(insertResult.length);
    } catch (e) {
      return false;
    }
  }

  public async toggleIsEmailConfirmed(
    userId: string,
    isConfirmed: boolean,
  ): Promise<boolean> {
    try {
      const updateResult = await this.dataSource.query(
        `
      UPDATE email_confirmations
      SET is_confirmed = $2
      WHERE user_id = $1
      `,
        [userId, isConfirmed],
      );

      return Boolean(updateResult.at(1));
    } catch (e) {
      return false;
    }
  }

  public async updateEmailConfirmationCode(
    userId: string,
    confirmationCode: string,
  ): Promise<boolean> {
    try {
      const updateResult = await this.dataSource.query(
        `
      UPDATE email_confirmations
      SET confirmation_code = $2
      WHERE user_id = $1
      `,
        [userId, confirmationCode],
      );

      return Boolean(updateResult.at(1));
    } catch (e) {
      return false;
    }
  }

  public async isLoginExist(login: string): Promise<boolean> {
    const isLogin = await this.dataSource.query(
      ` 
    select 1 from users u
    where login = $1
    `,
      [login],
    );

    return Boolean(isLogin.at(0));
  }

  public async isEmailExist(email: string): Promise<boolean> {
    const isExist = await this.dataSource.query(
      ` 
    select 1 from users u
    where email = $1
    `,
      [email],
    );

    return Boolean(isExist.at(0));
  }

  public async getUserByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<{
    user: UserJoined | null;
    foundBy: string | null;
  }> {
    const user = await this.dataSource.query(
      `
    SELECT
        u.id,
        u.login,
        u.password,
        u.email,
        u.created_at,
        rc.is_confirmed AS recovery_is_confirmed,
        rc.confirmation_code AS recovery_confirmation_code,
        ec.is_confirmed AS email_is_confirmed,
        ec.confirmation_code AS email_confirmation_code,
        ec.expiration_date AS email_expiration_date
    FROM
        users u
    LEFT JOIN
        email_confirmations ec ON u.id = ec.user_id
    LEFT JOIN
        recovery_code rc ON u.id = rc.user_id
     WHERE u.login = $1 OR u.email = $2
    `,
      [
        login, //$1
        email, //$2
      ],
    );

    if (!Boolean(user.length)) {
      return { user: null, foundBy: null };
    }

    const foundBy = user.at(0)?.login === login ? 'login' : 'email';
    return { user: user.at(0), foundBy };
  }

  public async getUserByConfirmationCode(
    confirmationCode: string,
  ): Promise<UserJoined | null> {
    const user = await this.dataSource.query(
      `
    SELECT
        u.id,
        u.login,
        u.password,
        u.email,
        u.created_at,
        rc.is_confirmed AS recovery_is_confirmed,
        rc.confirmation_code AS recovery_confirmation_code,
        ec.is_confirmed AS email_is_confirmed,
        ec.confirmation_code AS email_confirmation_code,
        ec.expiration_date AS email_expiration_date
    FROM
        users u
    LEFT JOIN
        email_confirmations ec ON u.id = ec.user_id
    LEFT JOIN
        recovery_code rc ON u.id = rc.user_id
     WHERE ec.confirmation_code = $1 
    `,
      [
        confirmationCode, //$1
      ],
    );

    if (!user) {
      return null;
    }

    return user.at(0);
  }
}
