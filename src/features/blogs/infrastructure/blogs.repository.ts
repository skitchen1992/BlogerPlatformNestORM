import { Injectable } from '@nestjs/common';
import { Blog } from '@features/blogs/domain/blog.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateBlogDto } from '@features/blogs/api/dto/input/update-blog.input.dto';
import { NewBlogDto } from '@features/blogs/api/dto/new-blog.dto';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  public async getBlogById(blogId: string): Promise<Blog | null> {
    try {
      return await this.blogRepository.findOneBy({ id: blogId });
    } catch (e) {
      console.error('Error inserting blog into database', e);
      return null;
    }
  }

  public async create(newBlog: NewBlogDto): Promise<string> {
    try {
      const blog = this.blogRepository.create({
        name: newBlog.name,
        description: newBlog.description,
        website_url: newBlog.websiteUrl,
        is_membership: newBlog.isMembership,
      });

      const result = await this.blogRepository.save(blog);
      return result.id;
    } catch (e) {
      console.error('Error inserting blog into database', {
        error: e,
      });
      return '';
    }
  }

  public async updateBlogById(
    blogId: string,
    data: UpdateBlogDto,
  ): Promise<boolean> {
    try {
      const updateResult = await this.blogRepository.update(
        { id: blogId },
        {
          name: data.name,
          description: data.description,
          website_url: data.websiteUrl,
        },
      );

      return Boolean(updateResult.affected);
    } catch (e) {
      console.error('Error updating blog into database', {
        error: e,
      });
      return false;
    }
  }

  public async deleteBlogById(blogId: string): Promise<boolean> {
    try {
      const deleteResult = await this.blogRepository.delete(blogId);
      return Boolean(deleteResult.affected);
    } catch (e) {
      console.error('Error during deleteBlogById operation:', e);
      return false;
    }
  }

  public async isBlogExist(blogId: string): Promise<boolean> {
    try {
      const count = await this.blogRepository.countBy({ id: blogId });
      return Boolean(count);
    } catch (e) {
      console.error('Error checking if blog exists', e);
      return false;
    }
  }
}
