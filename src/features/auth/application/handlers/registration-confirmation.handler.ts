import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '@features/users/infrastructure/users.repository';
import { BadRequestException } from '@nestjs/common';
import { getCurrentISOStringDate, isExpiredDate } from '@utils/dates';

export class RegistrationConfirmationCommand {
  constructor(public code: string) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationHandler
  implements ICommandHandler<RegistrationConfirmationCommand, void>
{
  constructor(private readonly usersRepository: UsersRepository) {}
  async execute(command: RegistrationConfirmationCommand): Promise<void> {
    const { code } = command;

    const user = await this.usersRepository.getUserByConfirmationCode(code);

    if (!user) {
      throw new BadRequestException({
        message: 'Activation code is not correct',
        key: 'code',
      });
    }

    if (user.emailConfirmation?.is_confirmed) {
      throw new BadRequestException({
        message: 'Email already confirmed',
        key: 'code',
      });
    }

    if (
      user.emailConfirmation?.expiration_date &&
      isExpiredDate({
        currentDate: getCurrentISOStringDate(),
        expirationDate: user.emailConfirmation.expiration_date.toString(),
      })
    ) {
      throw new BadRequestException({
        message: 'Confirmation code expired',
        key: 'code',
      });
    }

    await this.usersRepository.toggleIsEmailConfirmed(user.id!, true);
  }
}
