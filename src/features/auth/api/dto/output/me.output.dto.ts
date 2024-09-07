import { UserOutputDto } from '@features/users/api/dto/output/user.output.dto';

export class MeOutputDto {
  login: string;
  email: string;
  userId: string;
}

// MAPPERS

export const MeOutputDtoMapper = (user: UserOutputDto): MeOutputDto => {
  const outputDto = new MeOutputDto();

  outputDto.login = user.login;
  outputDto.email = user.email;
  outputDto.userId = user.id;

  return outputDto;
};
