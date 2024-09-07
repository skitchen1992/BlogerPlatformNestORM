import { Trim } from '@infrastructure/decorators/transform/trim';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdatePostForBlogDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @Trim()
  @Length(1, 30, { message: 'Title must be between 1 and 30 characters' })
  title: string;

  @IsNotEmpty({ message: 'ShortDescription is required' })
  @IsString({ message: 'Description must be a string' })
  @Trim()
  @Length(1, 100, {
    message: 'ShortDescription must be between 1 and 100 characters',
  })
  shortDescription: string;

  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  @Trim()
  @Length(1, 1000, {
    message: 'Content must be between 1 and 1000 characters',
  })
  content: string;
}
