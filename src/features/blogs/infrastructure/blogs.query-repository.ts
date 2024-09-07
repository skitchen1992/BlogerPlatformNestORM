import { Injectable } from '@nestjs/common';
import {
  BlogOutputDto,
  BlogOutputDtoMapper,
} from '../api/dto/output/blog.output.dto';
import {
  BlogOutputPaginationDto,
  BlogOutputPaginationDtoMapper,
  BlogsQuery,
} from '@features/blogs/api/dto/output/blog.output.pagination.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Blog } from '@features/blogs/domain/blog.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  public async getById(blogId: string): Promise<BlogOutputDto | null> {
    try {
      const blog = await this.dataSource.query(
        `
      SELECT *
      FROM blogs b
      WHERE b.id = $1
        `,
        [blogId],
      );

      if (!blog.at(0)) {
        return null;
      }

      return BlogOutputDtoMapper(blog.at(0));
    } catch (e) {
      return null;
    }
  }

  public async getAll(query: BlogsQuery): Promise<BlogOutputPaginationDto> {
    const {
      searchNameTerm,
      sortBy = 'createdAt',
      sortDirection = 'desc',
      pageNumber = 1,
      pageSize = 10,
    } = query;

    const validSortDirections = ['asc', 'desc'];
    const direction = validSortDirections.includes(sortDirection)
      ? sortDirection
      : 'desc';

    const validSortFields = ['created_at', 'name'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';

    let whereConditions = '';
    const queryParams: any[] = [];

    if (searchNameTerm) {
      whereConditions = `name ~* $1`;
      queryParams.push(`.*${searchNameTerm}.*`);
    } else {
      whereConditions = 'TRUE';
    }

    const collateClause = sortField === 'name' ? 'COLLATE "C"' : '';

    const blogs: Blog[] = await this.dataSource.query(
      `
    SELECT *
    FROM
        blogs 
    WHERE
        ${whereConditions}
    ORDER BY
        ${sortField} ${collateClause} ${direction}
    LIMIT $${queryParams.length + 1}
    OFFSET $${queryParams.length + 2} * ($${queryParams.length + 3} - 1);
    `,
      [
        ...queryParams,
        pageSize, // LIMIT
        pageSize, // OFFSET calculation
        pageNumber, // used for OFFSET
      ],
    );

    const totalCount = await this.dataSource.query(
      `
    SELECT COUNT(*)::int AS count
    FROM blogs
    WHERE
        ${whereConditions}
    `,
      queryParams,
    );

    const blogList = blogs.map((blog) => BlogOutputDtoMapper(blog));

    return BlogOutputPaginationDtoMapper(
      blogList,
      totalCount.at(0).count,
      Number(pageSize),
      Number(pageNumber),
    );
  }
}
