import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdatePostDto } from '@features/posts/api/dto/update-post.dto';
import { NewPostDto } from '@features/posts/api/dto/new-post.dto';
import { Post } from '@features/posts/domain/post.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  public async create(newPost: NewPostDto): Promise<string> {
    try {
      const post = this.postRepository.create({
        title: newPost.title,
        short_description: newPost.shortDescription,
        content: newPost.content,
        blog_id: newPost.blogId,
        blog_name: newPost.blogName,
      });

      const result = await this.postRepository.save(post);
      return result.id;
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
      const updateResult = await this.postRepository.update(
        { id: postId, blog_id: blogId },
        {
          title: data.title,
          short_description: data.shortDescription,
          content: data.content,
        },
      );

      return Boolean(updateResult.affected);
    } catch (e) {
      console.error('Error updating post into database', {
        error: e,
      });
      return false;
    }
  }

  public async delete(postId: string, blogId?: string): Promise<boolean> {
    try {
      const conditions = { id: postId };
      if (blogId) {
        Object.assign(conditions, { blog_id: blogId });
      }

      const result = await this.postRepository.delete(conditions);
      return Boolean(result.affected);
    } catch (e) {
      console.error('Error during delete post operation:', e);
      return false;
    }
  }
}
