import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '@features/blogs/infrastructure/blogs.repository';

//Обязательная регистрация в ioc
@ValidatorConstraint({ name: 'IsBlogExist', async: true })
@Injectable()
export class IsBlogExistConstrain implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async validate(value: any): Promise<boolean> {
    return await this.blogsRepository.isBlogExist(value);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `Blog id ${validationArguments?.value} not founded`;
  }
}

export function IsBlogExist(
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'IsBlogExist',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: IsBlogExistConstrain,
    });
  };
}
