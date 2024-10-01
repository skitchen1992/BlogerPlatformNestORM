import { Injectable } from '@nestjs/common';
import { Comment } from '../domain/comment.entity';
import { UpdateCommentDto } from '@features/comments/api/dto/input/update-comment.input.dto';
import { NewCommentDto } from '@features/comments/api/dto/new-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  public async getById(commentId: string): Promise<Comment | null> {
    try {
      return await this.commentRepository.findOne({
        where: { id: commentId },
      });
    } catch (e) {
      return null;
    }
  }

  public async create(newComment: NewCommentDto): Promise<string> {
    try {
      const comment = this.commentRepository.create({
        content: newComment.content,
        user_id: newComment.userId,
        user_login: newComment.userLogin,
        post_id: newComment.postId,
      });

      const savedComment = await this.commentRepository.save(comment);
      return savedComment.id;
    } catch (e) {
      console.error('Error inserting comment into database', {
        error: e,
      });
      return '';
    }
  }

  public async update(
    commentId: string,
    data: UpdateCommentDto,
  ): Promise<boolean> {
    try {
      const result = await this.commentRepository.update(
        { id: commentId },
        { content: data.content },
      );
      return Boolean(result.affected);
    } catch (e) {
      console.error('Error updating comment into database', {
        error: e,
      });
      return false;
    }
  }

  public async delete(commentId: string): Promise<boolean> {
    try {
      const result = await this.commentRepository.delete({ id: commentId });
      return Boolean(result.affected);
    } catch (e) {
      console.error('Error during delete comment operation:', e);
      return false;
    }
  }
}
