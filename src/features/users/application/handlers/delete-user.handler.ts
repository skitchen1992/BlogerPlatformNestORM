import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '@features/users/infrastructure/users.repository';
import { NotFoundException } from '@nestjs/common';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler
  implements ICommandHandler<DeleteUserCommand, void>
{
  constructor(private readonly usersRepository: UsersRepository) {}
  async execute(command: DeleteUserCommand) {
    const { userId } = command;

    const isDeleted: boolean = await this.usersRepository.delete(userId);

    if (!isDeleted) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
  }
}
