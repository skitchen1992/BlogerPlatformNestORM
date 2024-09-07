import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CommentOutputDto } from '@features/comments/api/dto/output/comment.output.dto';
import { CommentsQueryRepository } from '@features/comments/infrastructure/comments.query-repository';

export class GetCommentQuery {
  constructor(
    public commentId: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetCommentQuery)
export class GetCommentHandler
  implements IQueryHandler<GetCommentQuery, CommentOutputDto>
{
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}
  async execute(command: GetCommentQuery): Promise<CommentOutputDto> {
    const { commentId, userId } = command;

    const comment = await this.commentsQueryRepository.getById(
      commentId,
      userId,
    );

    if (!comment) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }

    return comment;
  }
}
