import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '@infrastructure/decorators/transform/trim';

export const IsLoginDecorator = () =>
  applyDecorators(
    Trim(),
    IsString({ message: 'Login must be a string' }),
    Length(3, 10, { message: 'Login must be between 3 and 10 characters' }),
    IsNotEmpty({ message: 'Login is required' }),
  );
