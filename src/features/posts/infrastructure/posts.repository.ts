import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UpdatePostDto } from '@features/posts/api/dto/update-post.dto';
import { NewPostDto } from '@features/posts/api/dto/new-post.dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  public async create(newPost: NewPostDto): Promise<string> {
    try {
      const result = await this.dataSource.query(
        `
      INSERT INTO posts (title, short_description, content, blog_id, blog_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `,
        [
          newPost.title,
          newPost.shortDescription,
          newPost.content,
          newPost.blogId,
          newPost.blogName,
        ],
      );

      return result[0].id;
    } catch (e) {
      console.error('Error inserting post into database', {
        error: e,
      });
      return '';
    }
  }

  public async update(
    postId: string,
    blogId: string,
    data: UpdatePostDto,
  ): Promise<boolean> {
    try {
      const updateResult = await this.dataSource.query(
        `
      UPDATE posts
      SET title = $1, 
          short_description = $2,
          content = $3
      WHERE id = $5 AND blog_id = $4
      RETURNING id;
      `,
        [data.title, data.shortDescription, data.content, blogId, postId],
      );

      return Boolean(updateResult.at(1));
    } catch (e) {
      console.error('Error updating post into database', {
        error: e,
      });
      return false;
    }
  }

  public async delete(postId: string, blogId?: string): Promise<boolean> {
    try {
      const conditions: string[] = ['id = $1'];
      const values: (string | undefined)[] = [postId];

      if (blogId) {
        conditions.push('blog_id = $2');
        values.push(blogId);
      }

      const result = await this.dataSource.query(
        `
      DELETE FROM posts 
      WHERE ${conditions.join(' AND ')}
      RETURNING *;
      `,
        values,
      );

      return Boolean(result.at(1));
    } catch (e) {
      console.error('Error during delete post operation:', e);
      return false;
    }
  }
}
