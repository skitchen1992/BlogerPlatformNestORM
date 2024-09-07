import { Post } from '@features/posts/domain/post.entity';
import { LikeStatusEnum } from '@features/likes/domain/likes.entity';

export type NewestLike = {
  addedAt: string;
  userId: string;
  login: string;
};

export type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatusEnum;
  newestLikes: NewestLike[];
};
export class PostOutputDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;
}

// MAPPERS

export const PostOutputDtoMapper = (
  post: Post,
  extendedLikesInfo: ExtendedLikesInfo,
): PostOutputDto => {
  const outputDto = new PostOutputDto();

  outputDto.id = post.id;
  outputDto.title = post.title;
  outputDto.shortDescription = post.short_description;
  outputDto.content = post.content;
  outputDto.blogId = post.blog_id;
  outputDto.blogName = post.blog_name;
  outputDto.createdAt = post.created_at.toISOString();
  outputDto.extendedLikesInfo = extendedLikesInfo;

  return outputDto;
};
