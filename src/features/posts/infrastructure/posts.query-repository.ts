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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '@features/posts/domain/post.entity';
import {
  Like,
  LikeStatusEnum,
  ParentTypeEnum,
} from '@features/likes/domain/likes.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private async getLikeDislikeCounts(
    postId: string,
  ): Promise<{ likes_count: number; dislikes_count: number }> {
    const counts = await this.likesRepository
      .createQueryBuilder('like')
      .select([
        `COUNT(CASE WHEN like.status = :like THEN 1 END) AS likes_count`,
        `COUNT(CASE WHEN like.status = :dislike THEN 1 END) AS dislikes_count`,
      ])
      .where('like.parent_id = :postId AND like.parent_type = :parentType', {
        postId,
        parentType: 'Post',
        like: LikeStatusEnum.LIKE,
        dislike: LikeStatusEnum.DISLIKE,
      })
      .getRawOne();

    return {
      likes_count: Number(counts.likes_count) || 0,
      dislikes_count: Number(counts.dislikes_count) || 0,
    };
  }

  private async getUserLikeStatus(
    postId: string,
    userId: string,
  ): Promise<LikeStatusEnum> {
    if (!userId) {
      return LikeStatusEnum.NONE;
    }

    const like = await this.likesRepository.findOne({
      where: {
        parent_id: postId,
        parent_type: ParentTypeEnum.POST,
        author_id: userId,
      },
    });

    return like?.status || LikeStatusEnum.NONE;
  }

  private async getNewestLikes(
    postId: string,
    count: number,
  ): Promise<NewestLike[]> {
    const newestLikes = await this.likesRepository
      .createQueryBuilder('like')
      .where(
        'like.parent_id = :postId AND like.parent_type = :parentType AND like.status = :status',
        {
          postId,
          parentType: 'Post',
          status: LikeStatusEnum.LIKE,
        },
      )
      .orderBy('like.created_at', 'DESC')
      .take(count)
      .getMany();

    return await Promise.all(
      newestLikes.map(async (like) => {
        const user = await this.usersRepository.findOne({
          where: { id: like.author_id },
        });

        return {
          addedAt: like.created_at.toISOString(),
          userId: like.author_id,
          login: user?.login || '',
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
      const post = await this.postsRepository.findOne({
        where: { id: postId },
      });

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

    const queryBuilder = this.postsRepository.createQueryBuilder('post');

    if (params?.blogId) {
      queryBuilder.where('post.blog_id = :blogId', { blogId: params.blogId });
    }

    queryBuilder
      .orderBy(`post.${sortField}`, direction.toUpperCase() as 'ASC' | 'DESC')
      .skip((Number(pageNumber) - 1) * Number(pageSize))
      .take(Number(pageSize));

    const [posts, totalCount] = await queryBuilder.getManyAndCount();

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

    return PostOutputPaginationDtoMapper(
      postList,
      totalCount,
      Number(pageSize),
      Number(pageNumber),
    );
  }
}
