import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SharedService } from '@infrastructure/servises/shared/shared.service';
import { COOKIE_KEY } from '@utils/consts';
import { UnauthorizedException } from '@nestjs/common';
import { CookieService } from '@infrastructure/servises/cookie/cookie.service';
import { Request } from 'express';
import { SessionsRepository } from '@features/session/infrastructure/sessions.repository';
import { fromUnixTimeToISO } from '@utils/dates';

export class LogoutCommand {
  constructor(public req: Request) {}
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(
    private readonly sharedService: SharedService,
    private readonly cookieService: CookieService,
    private readonly sessionsRepository: SessionsRepository,
  ) {}
  async execute(command: LogoutCommand): Promise<void> {
    const { req } = command;

    const refreshToken = this.cookieService.getCookie(
      req,
      COOKIE_KEY.REFRESH_TOKEN,
    );

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const { userId, deviceId, exp } =
      this.sharedService.verifyRefreshToken(refreshToken);

    if (!userId || !deviceId || !exp) {
      throw new UnauthorizedException();
    }

    const session = await this.sessionsRepository.getSessionByDeviceId(
      deviceId,
    );

    if (!session?.token_expiration_date) {
      throw new UnauthorizedException();
    }

    if (
      session.token_expiration_date.toISOString() !== fromUnixTimeToISO(exp)
    ) {
      throw new UnauthorizedException();
    }

    await this.sessionsRepository.deleteSessionByDeviceId(deviceId);
  }
}
