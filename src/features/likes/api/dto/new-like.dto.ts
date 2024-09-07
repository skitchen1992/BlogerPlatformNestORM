import {
  LikeStatusEnum,
  ParentTypeEnum,
} from '@features/likes/domain/likes.entity';

export class NewLikeDto {
  status: LikeStatusEnum;
  authorId: string;
  parentId: string;
  parentType: ParentTypeEnum;
}
