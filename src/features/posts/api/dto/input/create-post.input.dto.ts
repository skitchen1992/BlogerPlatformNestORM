import { Trim } from '@infrastructure/decorators/transform/trim';
import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';
import { IsBlogExist } from '@infrastructure/decorators/validate/is-blog-exist.decorator';

export class CreatePostDto {
  @IsString({ message: 'Title must be a string' })
  @Trim()
  @Length(1, 30, { message: 'Title must be between 1 and 30 characters' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString({ message: 'Description must be a string' })
  @Trim()
  @Length(1, 100, {
    message: 'ShortDescription must be between 1 and 100 characters',
  })
  @IsNotEmpty({ message: 'ShortDescription is required' })
  shortDescription: string;

  @IsString({ message: 'Content must be a string' })
  @Trim()
  @Length(1, 1000, {
    message: 'Content must be between 1 and 1000 characters',
  })
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @IsUUID()
  @IsString({ message: 'BlogId must be a string' })
  @Trim()
  @IsNotEmpty({ message: 'BlogId is required' })
  @IsBlogExist()
  blogId: string;
}
