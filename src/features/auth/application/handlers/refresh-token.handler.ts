import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { CookieService } from '@infrastructure/servises/cookie/cookie.service';
import { COOKIE_KEY } from '@utils/consts';
import { Request, Response } from 'express';
import { SessionsRepository } from '@features/session/infrastructure/sessions.repository';
import { fromUnixTimeToISO } from '@utils/dates';
import { SharedService } from '@infrastructure/servises/shared/shared.service';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '@settings/configuration';
import { RefreshTokenOutputDto } from '@features/auth/api/dto/output/refresh-token.output.dto';

export class RefreshTokenCommand {
  constructor(
    public res: Response,
    public req: Request,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements ICommandHandler<RefreshTokenCommand, RefreshTokenOutputDto>
{
  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private readonly sharedService: SharedService,
    private readonly cookieService: CookieService,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenOutputDto> {
    const { res, req } = command;

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

    const device = await this.sessionsRepository.getSessionByDeviceId(deviceId);

    if (!device?.token_expiration_date) {
      throw new UnauthorizedException();
    }

    if (device.token_expiration_date.toISOString() !== fromUnixTimeToISO(exp)) {
      throw new UnauthorizedException();
    }

    const apiSettings = this.configService.get('apiSettings', { infer: true });

    const newAccessToken = await this.sharedService.getAccessToken(userId);

    const newRefreshToken = await this.sharedService.getRefreshToken(
      userId,
      deviceId,
      { expiresIn: apiSettings.REFRESH_TOKEN_EXPIRED_IN },
    );

    await this.sessionsRepository.updateDatesByDeviceId(
      deviceId,
      this.sharedService.getTokenExpirationDate(newRefreshToken)!,
      new Date(),
    );

    this.cookieService.setCookie(
      res,
      COOKIE_KEY.REFRESH_TOKEN,
      newRefreshToken,
    );

    return { accessToken: newAccessToken };
  }
}
