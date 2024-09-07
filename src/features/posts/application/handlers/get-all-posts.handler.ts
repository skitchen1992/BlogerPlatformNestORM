import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  PostOutputPaginationDto,
  PostQuery,
} from '@features/posts/api/dto/output/post.output.pagination.dto';
import { PostsQueryRepository } from '@features/posts/infrastructure/posts.query-repository';

export class GetAllPostQuery {
  constructor(
    public query: PostQuery,
    public userId?: string,
  ) {}
}

@QueryHandler(GetAllPostQuery)
export class GetAllPostsHandler
  implements IQueryHandler<GetAllPostQuery, PostOutputPaginationDto>
{
  constructor(private readonly postsQueryRepository: PostsQueryRepository) {}
  async execute(command: GetAllPostQuery): Promise<PostOutputPaginationDto> {
    const { query, userId } = command;

    return await this.postsQueryRepository.getAll(query, {}, userId);
  }
}
