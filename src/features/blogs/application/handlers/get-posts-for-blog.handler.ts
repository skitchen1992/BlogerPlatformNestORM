import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '@features/blogs/infrastructure/blogs.query-repository';
import {
  PostOutputPaginationDto,
  PostQuery,
} from '@features/posts/api/dto/output/post.output.pagination.dto';
import { NotFoundException } from '@nestjs/common';
import { PostsQueryRepository } from '@features/posts/infrastructure/posts.query-repository';

export class GetPostForBlogQuery {
  constructor(
    public query: PostQuery,
    public blogId: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetPostForBlogQuery)
export class GetPostForBlogHandler
  implements IQueryHandler<GetPostForBlogQuery, PostOutputPaginationDto>
{
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}
  async execute(
    command: GetPostForBlogQuery,
  ): Promise<PostOutputPaginationDto> {
    const { query, blogId, userId } = command;

    const blog = await this.blogsQueryRepository.getById(blogId);

    if (!blog) {
      throw new NotFoundException(`Blog with id ${blogId} not found`);
    }

    return await this.postsQueryRepository.getAll(query, { blogId }, userId);
  }
}
