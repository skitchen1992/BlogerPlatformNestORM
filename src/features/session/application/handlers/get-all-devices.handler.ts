import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { AllDevicesOutputDto } from '@features/session/api/dto/output/allDevices.output.dto';
import { COOKIE_KEY } from '@utils/consts';
import { CookieService } from '@infrastructure/servises/cookie/cookie.service';
import { UnauthorizedException } from '@nestjs/common';
import { SessionsQueryRepository } from '@features/session/infrastructure/sessions.query-repository';
import { SharedService } from '@infrastructure/servises/shared/shared.service';

export class GetAllDevicesQuery {
  constructor(
    public res: Response,
    public req: Request,
  ) {}
}

@QueryHandler(GetAllDevicesQuery)
export class GetAllDevicesHandler
  implements IQueryHandler<GetAllDevicesQuery, AllDevicesOutputDto[]>
{
  constructor(
    protected readonly cookieService: CookieService,
    protected readonly sessionsQueryRepository: SessionsQueryRepository,
    protected readonly sharedService: SharedService,
  ) {}
  async execute(command: GetAllDevicesQuery): Promise<AllDevicesOutputDto[]> {
    const { req } = command;

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

    return this.sessionsQueryRepository.getDeviceListByUserId(userId);
  }
}
