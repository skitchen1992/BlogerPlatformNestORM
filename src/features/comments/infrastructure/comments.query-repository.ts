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
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatusEnum } from '@features/likes/domain/likes.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

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

    const result = await this.dataSource.query(
      `
    SELECT status
    FROM likes
    WHERE parent_id = $1
      AND parent_type = 'Comment'
      AND author_id = $2
    LIMIT 1;
    `,
      [commentId, userId],
    );

    return result?.at(0)?.status || LikeStatusEnum.NONE;
  }

  private async getLikeDislikeCounts(
    commentId: string,
  ): Promise<{ likes_count: number; dislikes_count: number }> {
    const result = await this.dataSource.query(
      `
    WITH counts AS (
        SELECT 
            COUNT(CASE WHEN status = 'Like' THEN 1 END) AS likes_count,
            COUNT(CASE WHEN status = 'Dislike' THEN 1 END) AS dislikes_count
        FROM likes
        WHERE parent_id = $1
          AND parent_type = 'Comment'
    )
    SELECT 
        COALESCE(likes_count, 0) AS likes_count,
        COALESCE(dislikes_count, 0) AS dislikes_count
    FROM counts;
    `,
      [commentId],
    );

    return {
      likes_count: Number(result.at(0).likes_count),
      dislikes_count: Number(result.at(0).dislikes_count),
    };
  }

  public async getById(
    commentId: string,
    userId?: string,
  ): Promise<CommentOutputDto | null> {
    try {
      const commentList: Comment[] = await this.dataSource.query(
        `
    SELECT *
    FROM comments c
    WHERE c.id = $1
    `,
        [commentId],
      );

      const comment = commentList.at(0);

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

    let whereConditions = '';
    const queryParams: any[] = [];

    if (params?.postId) {
      whereConditions = `post_id = $1`;
      queryParams.push(params.postId);
    } else {
      whereConditions = 'TRUE';
    }

    const collateClause = sortField === 'user_login' ? 'COLLATE "C"' : '';

    const comments: Comment[] = await this.dataSource.query(
      `
    SELECT *
    FROM
        comments
    WHERE
        ${whereConditions}
    ORDER BY
        ${sortField} ${collateClause} ${direction}
    LIMIT $${queryParams.length + 1}
    OFFSET $${queryParams.length + 2} * ($${queryParams.length + 3} - 1);
    `,
      [
        ...queryParams,
        pageSize, // LIMIT
        pageSize, // OFFSET calculation
        pageNumber, // used for OFFSET
      ],
    );

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

    const totalCount = await this.dataSource.query(
      `
    SELECT COUNT(*)::int AS count
    FROM comments
    WHERE
        ${whereConditions}
    `,
      queryParams,
    );

    return CommentOutputPaginationDtoMapper(
      commentList,
      totalCount.at(0).count,
      Number(pageSize),
      Number(pageNumber),
    );
  }
}
