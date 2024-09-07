import { IsLoginDecorator } from '@infrastructure/decorators/validate/is-login.decorator';
import { isEmail } from '@infrastructure/decorators/validate/is-email.decorator';
import { IsPasswordDecorator } from '@infrastructure/decorators/validate/is-password.decorator';
import { IsLoginExist } from '@infrastructure/decorators/validate/is-login-exist.decorator';
import { IsEmailExist } from '@infrastructure/decorators/validate/is-email-exist.decorator';

export class CreateUserDto {
  @IsLoginExist()
  @IsLoginDecorator()
  login: string;

  @IsPasswordDecorator()
  password: string;

  @IsEmailExist()
  @isEmail()
  email: string;
}
