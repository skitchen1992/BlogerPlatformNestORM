import { Injectable } from '@nestjs/common';

// Для провайдера всегда необходимо применять декоратор @Injectable() и регистрировать в модуле
@Injectable()
export class PostsService {
  constructor() {}
}
