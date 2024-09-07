import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HashBuilder } from '@utils/hash-builder';
import { NodeMailer } from '@infrastructure/servises/nodemailer/nodemailer.service';
import { JwtPayload } from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { JwtSignOptions } from '@nestjs/jwt/dist/interfaces';

@Injectable()
export class SharedService {
  constructor(
    private readonly hashBuilder: HashBuilder,
    protected readonly nodeMailer: NodeMailer,
    protected readonly jwtService: JwtService,
  ) {}

  public async isCorrectPass(
    password: string,
    userPassword: string,
  ): Promise<boolean> {
    return this.hashBuilder.compare(password, userPassword);
  }

  public verifyRecoveryCode(recoveryCode: string) {
    try {
      const { userId, exp } =
        (this.jwtService.verify(recoveryCode) as JwtPayload) ?? {};

      return { userId, exp };
    } catch (e) {
      throw new BadRequestException({
        message: 'Recovery code not correct',
        key: 'recoveryCode',
      });
    }
  }

  public verifyRefreshToken(refreshToken: string) {
    try {
      const { userId, exp, deviceId } =
        (this.jwtService.verify(refreshToken) as JwtPayload) ?? {};

      return { userId, exp, deviceId };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async generatePasswordHash(password: string): Promise<string> {
    return await this.hashBuilder.hash(password);
  }

  public async getAccessToken(userId: string | null, options?: JwtSignOptions) {
    return await this.jwtService.signAsync({ userId: userId }, options);
  }
  public async getRefreshToken(
    userId: string,
    deviceId: string,
    options?: JwtSignOptions,
  ) {
    return await this.jwtService.signAsync({ userId, deviceId }, options);
  }

  getTokenExpirationDate(token: string): Date | null {
    try {
      const { exp } = (this.jwtService.verify(token) as JwtPayload) ?? {};

      if (!exp) {
        return null;
      }

      return new Date(exp * 1000); // конвертируем секунды в миллисекунды
    } catch (e) {
      return null;
    }
  }

  public async sendRegisterEmail(to: string, confirmationCode: string) {
    const link = `https://blogger-platform-bay.vercel.app/api/auth/registration-confirmation?code=${confirmationCode}`;
    const subject = 'Confirm your email address';
    const text = `Please confirm your email address by clicking the following link: link`;
    const html = `<p>Please confirm your email address by clicking the link below:</p><p><a href="${link}">Confirm Email</a></p>`;

    this.nodeMailer.sendMail(to, subject, text, html);
  }

  public async sendRecoveryPassEmail(to: string, confirmationCode: string) {
    const link = `https://blogger-platform-bay.vercel.app/api/auth/password-recovery?recoveryCode=${confirmationCode}`;
    const subject = 'Password recovery';
    const text = `To finish password recovery please follow the link below: link`;
    const html = `<p>To finish password recovery please follow the link below:</p><p><a href="${link}">Password recovery</a></p>`;

    this.nodeMailer.sendMail(to, subject, text, html);
  }
}
