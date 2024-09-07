import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { COOKIE_KEY } from '@utils/consts';
import { CookieService } from '@infrastructure/servises/cookie/cookie.service';
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionsRepository } from '@features/session/infrastructure/sessions.repository';
import { SharedService } from '@infrastructure/servises/shared/shared.service';

export class DeleteDeviceCommand {
  constructor(
    public res: Response,
    public req: Request,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceHandler
  implements ICommandHandler<DeleteDeviceCommand, void>
{
  constructor(
    protected readonly cookieService: CookieService,
    protected readonly sessionsRepository: SessionsRepository,
    protected readonly sharedService: SharedService,
  ) {}
  async execute(command: DeleteDeviceCommand): Promise<void> {
    const { req, deviceId } = command;

    if (!deviceId) {
      throw new NotFoundException(`Device with id ${deviceId} not found`);
    }

    const refreshToken = this.cookieService.getCookie(
      req,
      COOKIE_KEY.REFRESH_TOKEN,
    );

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const { userId } = this.sharedService.verifyRefreshToken(refreshToken);

    if (!userId) {
      throw new UnauthorizedException();
    }

    const session = await this.sessionsRepository.getSessionByDeviceId(
      deviceId,
    );

    if (!session) {
      throw new NotFoundException(`Device with id ${deviceId} not found`);
    }

    if (session.user_id !== userId) {
      throw new ForbiddenException();
    }

    await this.sessionsRepository.deleteSessionByDeviceId(deviceId);
  }
}
