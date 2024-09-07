import { isEmail } from '@infrastructure/decorators/validate/is-email.decorator';

export class PasswordRecoveryDto {
  @isEmail()
  email: string;
}
