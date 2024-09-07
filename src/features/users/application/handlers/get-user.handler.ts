import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '@features/users/infrastructure/users.query-repository';
import { UserOutputDto } from '@features/users/api/dto/output/user.output.dto';
import { NotFoundException } from '@nestjs/common';

export class GetUserQuery {
  constructor(public userId: string) {}
}

@QueryHandler(GetUserQuery)
export class GetUserHandler
  implements IQueryHandler<GetUserQuery, UserOutputDto>
{
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}
  async execute(command: GetUserQuery): Promise<UserOutputDto> {
    const { userId } = command;

    const user = await this.usersQueryRepository.getById(userId);

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return user;
  }
}
