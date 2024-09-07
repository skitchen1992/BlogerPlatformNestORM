import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BlogsQueryRepository } from '@features/blogs/infrastructure/blogs.query-repository';

export class IsBlogExistCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(IsBlogExistCommand)
export class IsBlogExistHandler
  implements ICommandHandler<IsBlogExistCommand, void>
{
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}
  async execute(command: IsBlogExistCommand): Promise<void> {
    const { blogId } = command;

    const blog = await this.blogsQueryRepository.getById(blogId);

    if (!blog) {
      throw new NotFoundException(`Blog with id ${blogId} not found`);
    }
  }
}
