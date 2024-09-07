import { Session } from '@features/session/domain/session.entity';

export class AllDevicesOutputDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}

// MAPPERS

export const AllDevicesOutputDtoMapper = (
  session: Session,
): AllDevicesOutputDto => {
  const outputDto = new AllDevicesOutputDto();

  outputDto.ip = session.ip;
  outputDto.title = session.title;
  outputDto.lastActiveDate = session.last_active_date.toISOString();
  outputDto.deviceId = session.device_id;

  return outputDto;
};
