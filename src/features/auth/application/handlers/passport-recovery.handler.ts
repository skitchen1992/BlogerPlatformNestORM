import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '@features/users/infrastructure/users.repository';
import { RecoveryCodeDtoMapper } from '@features/auth/api/dto/recovery-code.dto';
import { SharedService } from '@infrastructure/servises/shared/shared.service';

export class PasswordRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryHandler
  implements ICommandHandler<PasswordRecoveryCommand, void>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly sharedService: SharedService,
  ) {}
  async execute(command: PasswordRecoveryCommand): Promise<void> {
    const { email } = command;

    const { user } = await this.usersRepository.getUserByLoginOrEmail(
      email,
      email,
    );

    if (!user) {
      const recoveryAccessToken = await this.sharedService.getAccessToken(null);
      await this.sharedService.sendRecoveryPassEmail(
        email,
        recoveryAccessToken,
      );
      return;
    }

    const userId = user.id!;

    const recoveryAccessToken = await this.sharedService.getAccessToken(userId);

    await this.usersRepository.insertRecoveryCode(
      userId,
      RecoveryCodeDtoMapper(recoveryAccessToken),
    );

    await this.sharedService.sendRecoveryPassEmail(email, recoveryAccessToken);
  }
}
