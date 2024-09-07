import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQuery } from '@features/users/api/dto/output/user.output.pagination.dto';
import { BlogsQueryRepository } from '@features/blogs/infrastructure/blogs.query-repository';
import { BlogOutputPaginationDto } from '@features/blogs/api/dto/output/blog.output.pagination.dto';

export class GetAllQuery {
  constructor(public query: UsersQuery) {}
}

@QueryHandler(GetAllQuery)
export class GetAllHandler
  implements IQueryHandler<GetAllQuery, BlogOutputPaginationDto>
{
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}
  async execute(command: GetAllQuery): Promise<BlogOutputPaginationDto> {
    const { query } = command;

    return await this.blogsQueryRepository.getAll(query);
  }
}
