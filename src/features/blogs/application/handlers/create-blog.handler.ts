import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '@features/blogs/infrastructure/blogs.repository';
import { NewBlogDto } from '@features/blogs/api/dto/new-blog.dto';

export class CreateBlogCommand {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler
  implements ICommandHandler<CreateBlogCommand, string>
{
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async execute(command: CreateBlogCommand): Promise<string> {
    const { name, description, websiteUrl } = command;

    const newBlog: NewBlogDto = {
      name,
      description,
      websiteUrl,
      isMembership: false,
    };

    return await this.blogsRepository.create(newBlog);
  }
}
