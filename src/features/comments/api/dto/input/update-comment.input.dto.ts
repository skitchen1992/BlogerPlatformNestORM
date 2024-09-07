import { Trim } from '@infrastructure/decorators/transform/trim';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateCommentDto {
  @IsString({ message: 'Content must be a string' })
  @Trim()
  @Length(20, 300, {
    message: 'Content must be between 20 and 300 characters',
  })
  @IsNotEmpty({ message: 'Content is required' })
  content: string;
}
