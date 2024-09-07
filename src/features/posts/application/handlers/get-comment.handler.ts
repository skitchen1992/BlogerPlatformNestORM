import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CommentsQueryRepository } from '@features/comments/infrastructure/comments.query-repository';
import { CommentOutputDto } from '@features/comments/api/dto/output/comment.output.dto';

export class GetCommentQuery {
  constructor(public commentId: string) {}
}

@QueryHandler(GetCommentQuery)
export class GetCommentForPostHandler
  implements IQueryHandler<GetCommentQuery, CommentOutputDto>
{
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}
  async execute(command: GetCommentQuery): Promise<CommentOutputDto> {
    const { commentId } = command;

    const comment = await this.commentsQueryRepository.getById(commentId);

    if (!comment) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }

    return comment;
  }
}
