import { Trim } from '@infrastructure/decorators/transform/trim';
import { IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';

export class UpdateBlogDto {
  @IsString({ message: 'Name must be a string' })
  @Trim()
  @Length(1, 15, { message: 'Name must be between 1 and 15 characters' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString({ message: 'Description must be a string' })
  @Trim()
  @Length(1, 500, {
    message: 'Description must be between 1 and 500 characters',
  })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsString({ message: 'WebsiteUrl must be a string' })
  @Trim()
  @Length(1, 100, {
    message: 'WebsiteUrl must be between 1 and 100 characters',
  })
  @IsNotEmpty({ message: 'WebsiteUrl is required' })
  @IsUrl()
  websiteUrl: string;
}
