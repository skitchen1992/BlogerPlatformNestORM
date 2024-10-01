import { Injectable } from '@nestjs/common';
import { Like, LikeStatusEnum, ParentTypeEnum } from '../domain/likes.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewLikeDto } from '@features/likes/api/dto/new-like.dto';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
  ) {}

  public async create(like: NewLikeDto): Promise<string> {
    try {
      const newLike = this.likeRepository.create({
        status: like.status,
        author_id: like.authorId,
        parent_id: like.parentId,
        parent_type: like.parentType,
      });

      const savedLike = await this.likeRepository.save(newLike);

      return savedLike.id;
    } catch (e) {
      console.error('Error inserting like into database', {
        error: e,
      });
      return '';
    }
  }

  public async get(
    userId: string,
    parentId: string,
    parentType: ParentTypeEnum,
  ): Promise<Like | null> {
    try {
      return await this.likeRepository.findOne({
        where: {
          author_id: userId,
          parent_id: parentId,
          parent_type: parentType,
        },
      });
    } catch (e) {
      console.error('Error retrieving like from database', { error: e });
      return null;
    }
  }

  public async update(
    likeId: string,
    likeStatus: LikeStatusEnum,
  ): Promise<boolean> {
    try {
      const updateResult = await this.likeRepository.update(likeId, {
        status: likeStatus,
      });

      return updateResult.affected === 1;
    } catch (e) {
      console.error('Error updating like into database', {
        error: e,
      });
      return false;
    }
  }
}
