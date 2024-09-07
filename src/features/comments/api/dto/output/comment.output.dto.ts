import { Comment } from '@features/comments/domain/comment.entity';
import { LikeStatusEnum } from '@features/likes/domain/likes.entity';

export interface ILikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatusEnum;
}
export class CommentOutputDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  postId: string;
  createdAt: string;
  likesInfo: ILikesInfo;
}

// MAPPERS

export const CommentOutputDtoMapper = (
  comment: Comment,
  likesInfo: ILikesInfo,
): CommentOutputDto => {
  const outputDto = new CommentOutputDto();

  outputDto.id = comment.id;
  outputDto.content = comment.content;
  outputDto.commentatorInfo = {
    userId: comment.user_id,
    userLogin: comment.user_login,
  };
  outputDto.createdAt = comment.created_at.toISOString();
  outputDto.likesInfo = likesInfo;

  return outputDto;
};
