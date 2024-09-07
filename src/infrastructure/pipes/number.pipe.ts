import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

// Custom pipe
// https://docs.nestjs.com/pipes#custom-pipes
@Injectable()
export class NumberPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, metadata: ArgumentMetadata) {
    const num = Number(value);

    if (isNaN(num)) {
      throw new BadRequestException('Not a number');
    }

    return num;
  }
}
