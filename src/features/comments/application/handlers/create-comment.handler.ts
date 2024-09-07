import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '@features/comments/infrastructure/comments.repository';
import { NewCommentDto } from '@features/comments/api/dto/new-comment.dto';

export class CreateCommentCommand {
  constructor(
    public content: string,
    public userId: string,
    public userLogin: string,
    public postId: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler
  implements ICommandHandler<CreateCommentCommand, string>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}
  async execute(command: CreateCommentCommand): Promise<string> {
    const { content, userId, userLogin, postId } = command;

    const newComment: NewCommentDto = {
      content,
      userId,
      userLogin,
      postId,
    };

    return await this.commentsRepository.create(newComment);
  }
}
