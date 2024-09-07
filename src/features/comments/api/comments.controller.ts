import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UpdateCommentDto } from '@features/comments/api/dto/input/update-comment.input.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '@features/comments/application/handlers/update-comment.handler';
import { DeleteCommentCommand } from '@features/comments/application/handlers/delete-comment.handler';
import { GetCommentQuery } from '@features/comments/application/handlers/get-comment.handler';
import { CommentOutputDto } from '@features/comments/api/dto/output/comment.output.dto';
import { JwtAuthGuard } from '@infrastructure/guards/bearer-auth-guard.service';
import { LikeDto } from '@features/posts/api/dto/input/like.input.dto';
import { Request } from 'express';
import { LikeOperationCommand } from '@features/posts/application/handlers/like-operation.handler';
import { IsCommentExistCommand } from '@features/comments/application/handlers/is-comment-exist.handler';
import { BearerTokenInterceptorGuard } from '@infrastructure/guards/bearer-token-interceptor-guard.service';
import { SkipThrottle } from '@nestjs/throttler';
import { ParentTypeEnum } from '@features/likes/domain/likes.entity';

@SkipThrottle()
@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(BearerTokenInterceptorGuard)
  @Get(':id')
  async getById(@Param('id') id: string, @Req() request: Request) {
    const userId = request.currentUser?.id.toString();

    return await this.queryBus.execute<GetCommentQuery, CommentOutputDto>(
      new GetCommentQuery(id, userId),
    );
  }

  @ApiSecurity('bearer')
  @UseGuards(JwtAuthGuard)
  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('commentId') commentId: string,
    @Body() input: UpdateCommentDto,
    @Req() request: Request,
  ) {
    const userId = request.currentUser!.id.toString();

    const { content } = input;

    await this.commandBus.execute<UpdateCommentCommand, void>(
      new UpdateCommentCommand(content, commentId, userId),
    );
  }

  @ApiSecurity('bearer')
  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('commentId') commentId: string, @Req() request: Request) {
    const userId = request.currentUser!.id.toString();

    await this.commandBus.execute<DeleteCommentCommand, void>(
      new DeleteCommentCommand(commentId, userId),
    );
  }

  @ApiSecurity('bearer')
  @UseGuards(JwtAuthGuard)
  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeOperation(
    @Body() input: LikeDto,
    @Param('commentId') commentId: string,
    @Req() request: Request,
  ) {
    await this.commandBus.execute<IsCommentExistCommand, void>(
      new IsCommentExistCommand(commentId),
    );

    const userId = request.currentUser!.id.toString();

    const { likeStatus } = input;

    await this.commandBus.execute<LikeOperationCommand, void>(
      new LikeOperationCommand(
        commentId,
        likeStatus,
        userId,
        ParentTypeEnum.COMMENT,
      ),
    );
  }
}
