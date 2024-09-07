import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PostsQueryRepository } from '@features/posts/infrastructure/posts.query-repository';

export class IsPostExistCommand {
  constructor(public postId: string) {}
}

@CommandHandler(IsPostExistCommand)
export class IsPostExistHandler
  implements ICommandHandler<IsPostExistCommand, void>
{
  constructor(private readonly postsQueryRepository: PostsQueryRepository) {}
  async execute(command: IsPostExistCommand): Promise<void> {
    const { postId } = command;

    const post = await this.postsQueryRepository.getById(postId);

    if (!post) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }
  }
}
