import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogDto } from '@features/blogs/api/dto/input/update-blog.input.dto';
import { BlogsRepository } from '@features/blogs/infrastructure/blogs.repository';
import { NotFoundException } from '@nestjs/common';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogHandler
  implements ICommandHandler<UpdateBlogCommand, void>
{
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async execute(command: UpdateBlogCommand): Promise<void> {
    const { id, name, description, websiteUrl } = command;

    const data: UpdateBlogDto = {
      name,
      description,
      websiteUrl,
    };

    const isUpdated: boolean = await this.blogsRepository.updateBlogById(
      id,
      data,
    );

    if (!isUpdated) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
  }
}
