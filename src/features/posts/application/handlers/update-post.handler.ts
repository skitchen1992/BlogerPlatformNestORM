import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '@features/posts/infrastructure/posts.repository';
import { NotFoundException } from '@nestjs/common';
import { UpdatePostDto } from '@features/posts/api/dto/update-post.dto';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostHandler
  implements ICommandHandler<UpdatePostCommand, void>
{
  constructor(private readonly postsRepository: PostsRepository) {}
  async execute(command: UpdatePostCommand): Promise<void> {
    const { postId, title, shortDescription, content, blogId } = command;

    const data: UpdatePostDto = {
      title,
      shortDescription,
      content,
    };

    const isUpdated: boolean = await this.postsRepository.update(
      postId,
      blogId,
      data,
    );

    if (!isUpdated) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }
  }
}
