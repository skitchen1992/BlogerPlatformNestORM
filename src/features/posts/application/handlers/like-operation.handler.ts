import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikesRepository } from '@features/likes/infrastructure/likes.repository';
import {
  LikeStatusEnum,
  ParentTypeEnum,
} from '@features/likes/domain/likes.entity';
import { NewLikeDto } from '@features/likes/api/dto/new-like.dto';

export class LikeOperationCommand {
  constructor(
    public postId: string,
    public likeStatus: LikeStatusEnum,
    public userId: string,
    public parentType: ParentTypeEnum,
  ) {}
}

@CommandHandler(LikeOperationCommand)
export class LikeOperationHandler
  implements ICommandHandler<LikeOperationCommand, void>
{
  constructor(private readonly likesRepository: LikesRepository) {}
  async execute(command: LikeOperationCommand): Promise<void> {
    const { postId, likeStatus, userId, parentType } = command;

    const like = await this.likesRepository.get(userId, postId, parentType);

    if (!like) {
      const newLike: NewLikeDto = {
        status: likeStatus,
        authorId: userId,
        parentId: postId,
        parentType,
      };

      await this.likesRepository.create(newLike);
      return;
    }

    if (likeStatus !== like.status) {
      await this.likesRepository.update(like.id, likeStatus);
    }
  }
}
