import { compare, genSalt, hash } from 'bcryptjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HashBuilder {
  public async hash(input: string, saltRounds = 10): Promise<string> {
    const salt = await genSalt(saltRounds);
    return await hash(input, salt);
  }

  public async compare(input: string, hashedInput: string): Promise<boolean> {
    return await compare(input, hashedInput);
  }
}
