import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserOutputDto } from '@features/users/api/dto/output/user.output.dto';
import {
  MeOutputDto,
  MeOutputDtoMapper,
} from '@features/auth/api/dto/output/me.output.dto';

export class GetMeQuery {
  constructor(public user: UserOutputDto) {}
}

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery, MeOutputDto> {
  constructor() {}
  async execute(command: GetMeQuery): Promise<MeOutputDto> {
    const { user } = command;

    return MeOutputDtoMapper(user);
  }
}
