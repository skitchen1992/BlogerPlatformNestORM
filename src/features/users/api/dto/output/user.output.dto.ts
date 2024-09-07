import { User } from '@features/users/domain/user.entity';

export class UserOutputDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

// MAPPERS

export const UserOutputDtoMapper = (user: User): UserOutputDto => {
  const outputDto = new UserOutputDto();

  outputDto.id = user.id!;
  outputDto.login = user.login;
  outputDto.email = user.email;
  outputDto.createdAt = user.created_at;

  return outputDto;
};
