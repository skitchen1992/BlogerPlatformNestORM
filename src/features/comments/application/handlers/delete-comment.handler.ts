import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '@features/comments/infrastructure/comments.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler
  implements ICommandHandler<DeleteCommentCommand, void>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}
  async execute(command: DeleteCommentCommand): Promise<void> {
    const { commentId, userId } = command;

    const comment = await this.commentsRepository.getById(commentId);

    if (!comment) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }

    if (userId !== comment.user_id) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.',
      );
    }

    const isDeleted: boolean = await this.commentsRepository.delete(commentId);

    if (!isDeleted) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }
  }
}
