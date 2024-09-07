import { Injectable } from '@nestjs/common';
import {
  ExtendedLikesInfo,
  NewestLike,
  PostOutputDto,
  PostOutputDtoMapper,
} from '../api/dto/output/post.output.dto';
import {
  PostOutputPaginationDto,
  PostOutputPaginationDtoMapper,
  PostQuery,
} from '@features/posts/api/dto/output/post.output.pagination.dto';
import { NEWEST_LIKES_COUNT } from '@utils/consts';
import { User } from '@features/users/domain/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Post } from '@features/posts/domain/post.entity';
import { Like, LikeStatusEnum } from '@features/likes/domain/likes.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private async getLikeDislikeCounts(
    postId: string,
  ): Promise<{ likes_count: number; dislikes_count: number }> {
    const result = await this.dataSource.query(
      `
    WITH counts AS (
        SELECT 
            COUNT(CASE WHEN status = 'Like' THEN 1 END) AS likes_count,
            COUNT(CASE WHEN status = 'Dislike' THEN 1 END) AS dislikes_count
        FROM likes
        WHERE parent_id = $1
          AND parent_type = 'Post'
    )
    SELECT 
        COALESCE(likes_count, 0) AS likes_count,
        COALESCE(dislikes_count, 0) AS dislikes_count
    FROM counts;
    `,
      [postId],
    );

    return {
      likes_count: Number(result.at(0).likes_count),
      dislikes_count: Number(result.at(0).dislikes_count),
    };
  }

  private async getUserLikeStatus(
    postId: string,
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
      AND parent_type = 'Post'
      AND author_id = $2
    LIMIT 1;
    `,
      [postId, userId],
    );

    return result?.at(0)?.status || LikeStatusEnum.NONE;
  }

  private async getNewestLikes(
    postId: string,
    count: number,
  ): Promise<NewestLike[]> {
    const newestLikes: Like[] = await this.dataSource.query(
      `
    SELECT l.created_at, l.author_id
    FROM likes l
    WHERE l.parent_id = $1
      AND l.parent_type = 'Post'
      AND l.status = 'Like'
    ORDER BY l.created_at DESC
    LIMIT $2;
    `,
      [postId, count],
    );

    return await Promise.all(
      newestLikes.map(async (like) => {
        const user: User[] = await this.dataSource.query(
          `
    SELECT * FROM users u
     WHERE u.id = $1
    `,
          [like.author_id],
        );

        return {
          addedAt: like.created_at.toISOString(),
          userId: like.author_id,
          login: user?.at(0)?.login || '',
        };
      }),
    );
  }

  private async getLikesInfoForAuthUser(
    postId: string,
    userId: string,
  ): Promise<ExtendedLikesInfo> {
    const likeDislikeCounts = await this.getLikeDislikeCounts(postId);
    const likeStatus = await this.getUserLikeStatus(postId, userId);
    const newestLikes = await this.getNewestLikes(postId, NEWEST_LIKES_COUNT);

    return {
      likesCount: likeDislikeCounts.likes_count,
      dislikesCount: likeDislikeCounts.dislikes_count,
      myStatus: likeStatus,
      newestLikes,
    };
  }

  private async getLikesInfoForNotAuthUser(
    postId: string,
  ): Promise<ExtendedLikesInfo> {
    const likeDislikeCounts = await this.getLikeDislikeCounts(postId);

    const likeStatus = await this.getUserLikeStatus(postId, '');

    const newestLikes = await this.getNewestLikes(postId, NEWEST_LIKES_COUNT);

    return {
      likesCount: likeDislikeCounts.likes_count,
      dislikesCount: likeDislikeCounts.dislikes_count,
      myStatus: likeStatus,
      newestLikes,
    };
  }

  public async getById(
    postId: string,
    userId?: string,
  ): Promise<PostOutputDto | null> {
    try {
      const postList = await this.dataSource.query(
        `
    SELECT *
    FROM posts p
    WHERE p.id = $1
    `,
        [postId],
      );

      const post = postList.at(0);

      if (!post) {
        return null;
      }

      const extendedLikesInfo = userId
        ? await this.getLikesInfoForAuthUser(postId, userId)
        : await this.getLikesInfoForNotAuthUser(postId);

      return PostOutputDtoMapper(post, extendedLikesInfo);
    } catch (e) {
      return null;
    }
  }

  public async getAll(
    query: PostQuery,
    params?: { blogId?: string },
    userId?: string,
  ): Promise<PostOutputPaginationDto> {
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

    const sortField = sortBy === 'blogName' ? 'blog_name' : 'created_at';

    let whereConditions = '';
    const queryParams: any[] = [];

    if (params?.blogId) {
      whereConditions = `blog_id = $1`;
      queryParams.push(params.blogId);
    } else {
      whereConditions = 'TRUE';
    }

    const collateClause = sortField === 'blog_name' ? 'COLLATE "C"' : '';
    const posts: Post[] = await this.dataSource.query(
      `
    SELECT *
    FROM
        posts 
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

    const postList = await Promise.all(
      posts.map(async (post) => {
        if (userId) {
          const extendedLikesInfo = await this.getLikesInfoForAuthUser(
            post.id,
            userId,
          );
          return PostOutputDtoMapper(post, extendedLikesInfo);
        } else {
          const extendedLikesInfo = await this.getLikesInfoForNotAuthUser(
            post.id,
          );
          return PostOutputDtoMapper(post, extendedLikesInfo);
        }
      }),
    );

    const totalCount = await this.dataSource.query(
      `
    SELECT COUNT(*)::int AS count
    FROM posts
    WHERE
        ${whereConditions}
    `,
      queryParams,
    );

    return PostOutputPaginationDtoMapper(
      postList,
      totalCount.at(0).count,
      Number(pageSize),
      Number(pageNumber),
    );
  }
}
