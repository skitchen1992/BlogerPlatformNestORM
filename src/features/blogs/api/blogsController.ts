import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { UsersQuery } from '@features/users/api/dto/output/user.output.pagination.dto';
import {
  PostOutputPaginationDto,
  PostQuery,
} from '@features/posts/api/dto/output/post.output.pagination.dto';
import { QueryBus } from '@nestjs/cqrs';
import { GetAllQuery } from '@features/blogs/application/handlers/get-all.handler';
import { BlogOutputPaginationDto } from '@features/blogs/api/dto/output/blog.output.pagination.dto';
import { GetPostForBlogQuery } from '@features/blogs/application/handlers/get-posts-for-blog.handler';
import { GetBlogQuery } from '@features/blogs/application/handlers/get-blog.handler';
import { Request } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { BearerTokenInterceptorGuard } from '@infrastructure/guards/bearer-token-interceptor-guard.service';

// Tag для swagger
@SkipThrottle()
@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async getAll(@Query() query: UsersQuery) {
    return await this.queryBus.execute<GetAllQuery, BlogOutputPaginationDto>(
      new GetAllQuery(query),
    );
  }

  @UseGuards(BearerTokenInterceptorGuard)
  @Get(':blogId/posts')
  async getPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: PostQuery,
    @Req() request: Request,
  ) {
    const userId = request.currentUser?.id.toString();

    return await this.queryBus.execute<
      GetPostForBlogQuery,
      PostOutputPaginationDto
    >(new GetPostForBlogQuery(query, blogId, userId));
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return await this.queryBus.execute<GetBlogQuery, PostOutputPaginationDto>(
      new GetBlogQuery(id),
    );
  }
}
