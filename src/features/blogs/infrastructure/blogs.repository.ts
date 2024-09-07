import { Injectable } from '@nestjs/common';
import { Blog } from '@features/blogs/domain/blog.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UpdateBlogDto } from '@features/blogs/api/dto/input/update-blog.input.dto';
import { NewBlogDto } from '@features/blogs/api/dto/new-blog.dto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  public async getBlogById(blogId: string): Promise<Blog | null> {
    try {
      const blog = await this.dataSource.query(
        `
    SELECT *
    FROM
        blogs b
     WHERE b.id = $1
    `,
        [blogId],
      );

      if (!blog.at(0)) {
        return null;
      }

      return blog.at(0);
    } catch (e) {
      return null;
    }
  }

  public async create(newBlog: NewBlogDto): Promise<string> {
    try {
      const result = await this.dataSource.query(
        `
      INSERT INTO blogs (name, description, website_url, is_membership)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `,
        [
          newBlog.name,
          newBlog.description,
          newBlog.websiteUrl,
          newBlog.isMembership,
        ],
      );

      return result[0].id;
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
      const updateResult = await this.dataSource.query(
        `
      UPDATE blogs
      SET name = $1, 
          description = $2,
          website_url = $3
      WHERE id = $4
      RETURNING id;
      `,
        [data.name, data.description, data.websiteUrl, blogId],
      );

      return Boolean(updateResult.at(1));
    } catch (e) {
      console.error('Error updating blog into database', {
        error: e,
      });
      return false;
    }
  }

  public async deleteBlogById(blogId: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `
      DELETE FROM blogs 
      WHERE id = $1
      RETURNING *;
      `,
        [blogId],
      );

      return Boolean(result.at(1));
    } catch (e) {
      console.error('Error during deleteBlogById operation:', e);
      return false;
    }
  }

  public async isBlogExist(blogId: string): Promise<boolean> {
    try {
      const isBlogExist = await this.dataSource.query(
        ` 
    select 1 from blogs 
    where id = $1
    `,
        [blogId],
      );

      return Boolean(isBlogExist.at(0));
    } catch (e) {
      return false;
    }
  }
}
