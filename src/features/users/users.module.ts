import { Module, Provider } from '@nestjs/common';
import { UsersRepository } from '@features/users/infrastructure/users.repository';
import { UsersService } from '@features/users/application/users.service';
import { UsersQueryRepository } from '@features/users/infrastructure/users.query-repository';
import { CreateUserHandler } from '@features/users/application/handlers/create-user.handler';
import { DeleteUserHandler } from '@features/users/application/handlers/delete-user.handler';
import { GetAllUsersHandler } from '@features/users/application/handlers/get-all-users.handler';
import { GetUserHandler } from '@features/users/application/handlers/get-user.handler';
import { UsersController } from '@features/users/api/users.controller';
import { SharedModule } from '../../modules/shared.module';

const usersProviders: Provider[] = [
  UsersRepository,
  UsersService,
  UsersQueryRepository,
  CreateUserHandler,
  DeleteUserHandler,
  GetAllUsersHandler,
  GetUserHandler,
];

@Module({
  imports: [SharedModule],
  providers: [...usersProviders],
  controllers: [UsersController],
  exports: [UsersQueryRepository, UsersRepository],
})
export class UsersModule {}
