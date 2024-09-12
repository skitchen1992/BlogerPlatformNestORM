import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '@features/users/infrastructure/users.repository';
import { BadRequestException } from '@nestjs/common';
import { getCurrentISOStringDate, isExpiredDate } from '@utils/dates';
import { getUniqueId } from '@utils/utils';
import { SharedService } from '@infrastructure/servises/shared/shared.service';

export class RegistrationEmailResendingCommand {
  constructor(public email: string) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingHandler
  implements ICommandHandler<RegistrationEmailResendingCommand, void>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly sharedService: SharedService,
  ) {}
  async execute(command: RegistrationEmailResendingCommand): Promise<void> {
    const { email } = command;

    const { user } = await this.usersRepository.getUserByLoginOrEmail(
      email,
      email,
    );

    if (!user) {
      throw new BadRequestException({
        message: 'Email not found',
        key: 'email',
      });
    }

    if (user.emailConfirmation?.is_confirmed) {
      throw new BadRequestException({
        message: 'Email already confirmed',
        key: 'email',
      });
    }

    if (
      user.emailConfirmation?.expiration_date &&
      isExpiredDate({
        expirationDate: user.emailConfirmation.expiration_date.toString(),
        currentDate: getCurrentISOStringDate(),
      })
    ) {
      throw new BadRequestException({
        message: 'Confirmation code expired',
        key: 'code',
      });
    }

    const confirmationCode = getUniqueId();

    await this.usersRepository.updateEmailConfirmationCode(
      user.id,
      confirmationCode,
    );

    await this.sharedService.sendRegisterEmail(email, confirmationCode);
  }
}
