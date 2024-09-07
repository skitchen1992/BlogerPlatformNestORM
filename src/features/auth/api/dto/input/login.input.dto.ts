import { IsPasswordDecorator } from '@infrastructure/decorators/validate/is-password.decorator';
import { Trim } from '@infrastructure/decorators/transform/trim';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'LoginOrEmail is required' })
  @IsString()
  @Trim()
  loginOrEmail: string;

  @IsPasswordDecorator()
  password: string;
}
