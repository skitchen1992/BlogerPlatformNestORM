import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  UserOutputPaginationDto,
  UsersQuery,
} from '@features/users/api/dto/output/user.output.pagination.dto';
import { UsersQueryRepository } from '@features/users/infrastructure/users.query-repository';

export class GetAllUsersQuery {
  constructor(public query: UsersQuery) {}
}

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler
  implements IQueryHandler<GetAllUsersQuery, UserOutputPaginationDto>
{
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}
  async execute(command: GetAllUsersQuery): Promise<UserOutputPaginationDto> {
    const { query } = command;

    return await this.usersQueryRepository.getAll(query);
  }
}
