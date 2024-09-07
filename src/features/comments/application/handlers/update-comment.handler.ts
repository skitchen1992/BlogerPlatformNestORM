import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '@features/comments/infrastructure/comments.repository';
import { UpdateCommentDto } from '@features/comments/api/dto/input/update-comment.input.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class UpdateCommentCommand {
  constructor(
    public content: string,
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler
  implements ICommandHandler<UpdateCommentCommand, void>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}
  async execute(command: UpdateCommentCommand): Promise<void> {
    const { content, commentId, userId } = command;

    const comment = await this.commentsRepository.getById(commentId);

    if (!comment) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }

    if (userId !== comment.user_id) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.',
      );
    }

    const data: UpdateCommentDto = {
      content,
    };

    const isUpdated: boolean = await this.commentsRepository.update(
      commentId,
      data,
    );

    if (!isUpdated) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }
  }
}
