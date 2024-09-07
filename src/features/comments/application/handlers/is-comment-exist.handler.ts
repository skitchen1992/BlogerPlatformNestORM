import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CommentsRepository } from '@features/comments/infrastructure/comments.repository';

export class IsCommentExistCommand {
  constructor(public commentId: string) {}
}

@CommandHandler(IsCommentExistCommand)
export class IsCommentExistHandler
  implements ICommandHandler<IsCommentExistCommand, void>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}
  async execute(command: IsCommentExistCommand): Promise<void> {
    const { commentId } = command;

    const comment = await this.commentsRepository.getById(commentId);

    if (!comment) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }
  }
}
