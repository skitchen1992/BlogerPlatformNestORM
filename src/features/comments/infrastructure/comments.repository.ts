import { Injectable } from '@nestjs/common';
import { Comment } from '../domain/comment.entity';
import { UpdateCommentDto } from '@features/comments/api/dto/input/update-comment.input.dto';
import { NewCommentDto } from '@features/comments/api/dto/new-comment.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  public async getById(commentId: string): Promise<Comment | null> {
    try {
      const commentList: Comment[] = await this.dataSource.query(
        `
    SELECT *
    FROM comments c
    WHERE c.id = $1
    `,
        [commentId],
      );

      const comment = commentList.at(0);

      if (!comment) {
        return null;
      }

      return comment;
    } catch (e) {
      return null;
    }
  }

  public async create(newComment: NewCommentDto): Promise<string> {
    try {
      const result = await this.dataSource.query(
        `
      INSERT INTO comments (content, user_id, user_login, post_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `,
        [
          newComment.content,
          newComment.userId,
          newComment.userLogin,
          newComment.postId,
        ],
      );

      return result[0].id;
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
      const updateResult = await this.dataSource.query(
        `
      UPDATE comments
      SET content = $1 
      WHERE id = $2
      RETURNING id;
      `,
        [data.content, commentId],
      );

      return Boolean(updateResult.at(1));
    } catch (e) {
      console.error('Error updating comment into database', {
        error: e,
      });
      return false;
    }
  }

  public async delete(commentId: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `
      DELETE FROM comments 
      WHERE id = $1
      RETURNING *;
      `,
        [commentId],
      );

      return Boolean(result.at(1));
    } catch (e) {
      console.error('Error during delete comment operation:', e);
      return false;
    }
  }
}
