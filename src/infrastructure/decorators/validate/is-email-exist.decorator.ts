import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@features/users/infrastructure/users.repository';

//Обязательная регистрация в ioc
@ValidatorConstraint({ name: 'IsEmailExist', async: true })
@Injectable()
export class IsEmailExistConstrain implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) {}

  async validate(value: any): Promise<boolean> {
    const isEmailExist = await this.usersRepository.isEmailExist(value);
    return !isEmailExist;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.value} already exist`;
  }
}

export function IsEmailExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsEmailExist',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: IsEmailExistConstrain,
    });
  };
}
