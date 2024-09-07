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
@ValidatorConstraint({ name: 'IsLoginExist', async: true })
@Injectable()
export class IsLoginExistConstrain implements ValidatorConstraintInterface {
  constructor(private readonly usersRepository: UsersRepository) {}

  async validate(value: any): Promise<boolean> {
    const isLoginExist = await this.usersRepository.isLoginExist(value);
    return !isLoginExist;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.value} already exist`;
  }
}

export function IsLoginExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsLoginExist',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: IsLoginExistConstrain,
    });
  };
}
