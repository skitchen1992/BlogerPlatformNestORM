import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Trim } from '../transform/trim';

// Объединение декораторов
// https://docs.nestjs.com/custom-decorators#decorator-composition
export const isEmail = () =>
  applyDecorators(
    Trim(),
    IsEmail({}, { message: 'Email must be a valid email address' }),
    IsNotEmpty({ message: 'Email is required' }),
  );
