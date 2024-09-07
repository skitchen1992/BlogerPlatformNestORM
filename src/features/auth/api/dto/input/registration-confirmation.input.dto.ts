import { Trim } from '@infrastructure/decorators/transform/trim';
import { IsString } from 'class-validator';

export class RegistrationConfirmationDto {
  @IsString({ message: 'Code must be a string' })
  @Trim()
  code: string;
}
