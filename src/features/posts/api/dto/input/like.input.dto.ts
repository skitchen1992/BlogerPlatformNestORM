import { Trim } from '@infrastructure/decorators/transform/trim';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LikeStatusEnum } from '@features/likes/domain/likes.entity';

export class LikeDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @Trim()
  @IsEnum(LikeStatusEnum, {
    message: 'LikeStatus must be one of the following: None, Like, Dislike',
  })
  likeStatus: LikeStatusEnum;
}
