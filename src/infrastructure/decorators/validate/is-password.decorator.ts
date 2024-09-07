import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '@infrastructure/decorators/transform/trim';

export const IsPasswordDecorator = () =>
  applyDecorators(
    Trim(),
    IsString({ message: 'Password must be a string' }),
    Length(6, 20, { message: 'Password must be between 6 and 20 characters' }),
    IsNotEmpty({ message: 'Password is required' }),
  );
