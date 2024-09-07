import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '@features/blogs/infrastructure/blogs.query-repository';
import { NotFoundException } from '@nestjs/common';
import { BlogOutputDto } from '@features/blogs/api/dto/output/blog.output.dto';

export class GetBlogQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetBlogQuery)
export class GetBlogHandler
  implements IQueryHandler<GetBlogQuery, BlogOutputDto>
{
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}
  async execute(command: GetBlogQuery): Promise<BlogOutputDto> {
    const { id } = command;

    const blog = await this.blogsQueryRepository.getById(id);

    if (!blog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return blog;
  }
}
