import { Injectable } from '@nestjs/common';
import { Comment } from '../domain/comment.entity';
import {
  CommentOutputDto,
  CommentOutputDtoMapper,
  ILikesInfo,
} from '../api/dto/output/comment.output.dto';
import {
  CommentOutputPaginationDto,
  CommentOutputPaginationDtoMapper,
  CommentQuery,
} from '@features/comments/api/dto/output/comment.output.pagination.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Like,
  LikeStatusEnum,
  ParentTypeEnum,
} from '@features/likes/domain/likes.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
  ) {}

  private async getLikesInfoForAuthUser(
    commentId: string,
    userId: string,
  ): Promise<ILikesInfo> {
    const likeDislikeCounts = await this.getLikeDislikeCounts(commentId);
    const likeStatus = await this.getUserLikeStatus(commentId, userId);

    return {
      likesCount: likeDislikeCounts.likes_count,
      dislikesCount: likeDislikeCounts.dislikes_count,
      myStatus: likeStatus,
    };
  }

  private async getLikesInfoForNotAuthUser(
    commentId: string,
  ): Promise<ILikesInfo> {
    const likeDislikeCounts = await this.getLikeDislikeCounts(commentId);
    const likeStatus = await this.getUserLikeStatus(commentId, '');

    return {
      likesCount: likeDislikeCounts.likes_count,
      dislikesCount: likeDislikeCounts.dislikes_count,
      myStatus: likeStatus,
    };
  }

  private async getUserLikeStatus(
    commentId: string,
    userId: string,
  ): Promise<LikeStatusEnum> {
    if (!userId) {
      return LikeStatusEnum.NONE;
    }

    const like = await this.likeRepository.findOne({
      where: {
        parent_id: commentId,
        parent_type: ParentTypeEnum.COMMENT,
        author_id: userId,
      },
      select: ['status'],
    });

    return like?.status || LikeStatusEnum.NONE;
  }

  private async getLikeDislikeCounts(
    commentId: string,
  ): Promise<{ likes_count: number; dislikes_count: number }> {
    const result = await this.likeRepository
      .createQueryBuilder('like')
      .select([
        `COUNT(CASE WHEN like.status = :like THEN 1 END) AS likes_count`,
        `COUNT(CASE WHEN like.status = :dislike THEN 1 END) AS dislikes_count`,
      ])
      .where('like.parent_id = :commentId', { commentId })
      .andWhere('like.parent_type = :parentType', {
        parentType: ParentTypeEnum.COMMENT,
      })
      .setParameters({
        like: LikeStatusEnum.LIKE,
        dislike: LikeStatusEnum.DISLIKE,
      })
      .getRawOne();

    return {
      likes_count: Number(result.likes_count),
      dislikes_count: Number(result.dislikes_count),
    };
  }

  public async getById(
    commentId: string,
    userId?: string,
  ): Promise<CommentOutputDto | null> {
    try {
      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
      });

      if (!comment) {
        return null;
      }

      if (!userId) {
        const likeInfo = await this.getLikesInfoForNotAuthUser(commentId);
        return CommentOutputDtoMapper(comment, likeInfo);
      }

      const likeInfo = await this.getLikesInfoForAuthUser(commentId, userId);
      return CommentOutputDtoMapper(comment, likeInfo);
    } catch (e) {
      return null;
    }
  }

  public async getAll(
    query: CommentQuery,
    params?: { postId: string },
    userId?: string,
  ): Promise<CommentOutputPaginationDto> {
    const {
      sortBy = 'createdAt',
      sortDirection = 'desc',
      pageNumber = 1,
      pageSize = 10,
    } = query;

    const validSortDirections = ['asc', 'desc'];
    const direction = validSortDirections.includes(sortDirection)
      ? sortDirection
      : 'desc';

    const sortField = sortBy === 'userLogin' ? 'user_login' : 'created_at';

    const queryBuilder = this.commentRepository.createQueryBuilder('comment');

    if (params?.postId) {
      queryBuilder.where('comment.post_id = :postId', {
        postId: params.postId,
      });
    }

    queryBuilder
      .orderBy(
        `comment.${sortField}`,
        direction.toUpperCase() as 'ASC' | 'DESC',
      )
      .skip((Number(pageNumber) - 1) * Number(pageSize))
      .take(Number(pageSize));

    const [comments, totalCount] = await queryBuilder.getManyAndCount();

    const commentList = await Promise.all(
      comments.map(async (comment) => {
        if (userId) {
          const like = await this.getLikesInfoForAuthUser(comment.id, userId);
          return CommentOutputDtoMapper(comment, like);
        } else {
          const like = await this.getLikesInfoForNotAuthUser(comment.id);
          return CommentOutputDtoMapper(comment, like);
        }
      }),
    );

    return CommentOutputPaginationDtoMapper(
      commentList,
      totalCount,
      Number(pageSize),
      Number(pageNumber),
    );
  }
}
