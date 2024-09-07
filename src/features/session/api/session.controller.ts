import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAllDevicesQuery } from '@features/session/application/handlers/get-all-devices.handler';
import { AllDevicesOutputDto } from '@features/session/api/dto/output/allDevices.output.dto';
import { DeleteAllDevicesCommand } from '@features/session/application/handlers/delete-all-devices.handler';
import { DeleteDeviceCommand } from '@features/session/application/handlers/delete-device.handler';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@ApiTags('Security')
@Controller('security')
export class SessionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('devices')
  @HttpCode(HttpStatus.OK)
  async getAllDevices(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return await this.queryBus.execute<
      GetAllDevicesQuery,
      AllDevicesOutputDto[]
    >(new GetAllDevicesQuery(res, req));
  }

  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllDevices(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    await this.commandBus.execute<DeleteAllDevicesCommand, void>(
      new DeleteAllDevicesCommand(res, req),
    );
  }

  @Delete('devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevice(
    @Param('deviceId') deviceId: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    await this.commandBus.execute<DeleteDeviceCommand, void>(
      new DeleteDeviceCommand(res, req, deviceId),
    );
  }
}
