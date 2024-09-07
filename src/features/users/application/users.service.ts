import { Injectable } from '@nestjs/common';
import { HashBuilder } from '@utils/hash-builder';

// Для провайдера всегда необходимо применять декоратор @Injectable() и регистрировать в модуле
@Injectable()
export class UsersService {
  constructor(private readonly hashBuilder: HashBuilder) {}

  async generatePasswordHash(password: string): Promise<string> {
    return await this.hashBuilder.hash(password);
  }
}
