import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecoveryCodeDto } from '@features/auth/api/dto/recovery-code.dto';
import { NewUserDto } from '@features/users/api/dto/new-user.dto';
import { User } from '@features/users/domain/user.entity';
import { NewEmailConfirmationDto } from '@features/auth/api/dto/new-email-confirmation.dto';
import { EmailConfirmation } from '@features/users/domain/emailConfirmation.entity';
import { RecoveryCode } from '@features/users/domain/recoveryCode.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(EmailConfirmation)
    private emailConfirmationRepository: Repository<EmailConfirmation>,
    @InjectRepository(RecoveryCode)
    private recoveryCodeRepository: Repository<RecoveryCode>,
  ) {}

  public async getUserById(userId: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: {
          id: userId,
        },
        relations: {
          recoveryCode: {},
          emailConfirmation: {},
        },
      });
    } catch (e) {
      console.error('Error getUserById', {
        error: e,
      });
      return null;
    }
  }

  public async create(
    newUser: NewUserDto,
    emailConfirmation?: NewEmailConfirmationDto,
  ): Promise<string> {
    try {
      const user = this.userRepository.create({
        login: newUser.login,
        password: newUser.password,
        email: newUser.email,
      });

      const savedUser = await this.userRepository.save(user);

      const userId = savedUser.id;

      if (emailConfirmation) {
        const emailConf = this.emailConfirmationRepository.create({
          user_id: userId,
          is_confirmed: emailConfirmation.isConfirmed,
          confirmation_code: emailConfirmation.confirmationCode,
          expiration_date: emailConfirmation.expirationDate,
        });

        await this.emailConfirmationRepository.save(emailConf);
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
      const result = await this.userRepository.delete(userId);

      return Boolean(result.affected);
    } catch (e) {
      console.error('Error during delete user operation:', e);
      return false;
    }
  }

  public async updatePassword(
    userId: string,
    password: string,
  ): Promise<boolean> {
    try {
      const result = await this.userRepository.update(userId, { password });

      return Boolean(result.affected);
    } catch (e) {
      console.error('Error during update user operation:', e);
      return false;
    }
  }

  public async insertRecoveryCode(
    userId: string,
    recoveryCodeDto: RecoveryCodeDto,
  ): Promise<boolean> {
    try {
      // Attempt to update the existing recovery code record
      const updateResult = await this.recoveryCodeRepository.update(
        { user_id: userId },
        {
          confirmation_code: recoveryCodeDto.confirmationCode,
          is_confirmed: recoveryCodeDto.isConfirmed,
        },
      );

      // If an existing record was updated, return true
      if (Boolean(updateResult.affected)) {
        return true;
      }

      // If no record was updated, insert a new recovery code record
      const newRecoveryCode = this.recoveryCodeRepository.create({
        user_id: userId,
        confirmation_code: recoveryCodeDto.confirmationCode,
        is_confirmed: recoveryCodeDto.isConfirmed,
      });

      const insertResult = await this.recoveryCodeRepository.save(
        newRecoveryCode,
      );

      return Boolean(insertResult);
    } catch (e) {
      console.error('Error during insertRecoveryCode operation:', e);

      return false;
    }
  }

  public async toggleIsEmailConfirmed(
    userId: string,
    isConfirmed: boolean,
  ): Promise<boolean> {
    try {
      const updateResult = await this.emailConfirmationRepository.update(
        { user_id: userId },
        {
          is_confirmed: isConfirmed,
        },
      );

      return Boolean(updateResult.affected);
    } catch (e) {
      console.error('Error during toggleIsEmailConfirmed operation:', e);

      return false;
    }
  }

  public async updateEmailConfirmationCode(
    userId: string,
    confirmationCode: string,
  ): Promise<boolean> {
    try {
      const updateResult = await this.emailConfirmationRepository.update(
        { user_id: userId },
        {
          confirmation_code: confirmationCode,
        },
      );

      return Boolean(updateResult.affected);
    } catch (e) {
      console.error('Error during updateEmailConfirmationCode operation:', e);

      return false;
    }
  }

  public async isLoginExist(login: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: {
        login,
      },
      select: ['id'],
    });
    return Boolean(user);
  }

  public async isEmailExist(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      select: ['id'],
    });
    return Boolean(user);
  }

  public async getUserByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<{
    user: User | null;
    foundBy: string | null;
  }> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.emailConfirmation', 'emailConfirmation')
      .leftJoinAndSelect('user.recoveryCode', 'recoveryCode')
      .where('user.login = :login', { login })
      .orWhere('user.email = :email', { email })
      .getOne();

    if (!user) {
      return { user: null, foundBy: null };
    }

    const foundBy = user.login === login ? 'login' : 'email';
    return { user, foundBy };
  }

  public async getUserByConfirmationCode(
    confirmationCode: string,
  ): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        emailConfirmation: {
          confirmation_code: confirmationCode,
        },
      },
      relations: {
        recoveryCode: {},
        emailConfirmation: {},
      },
    });
  }
}
