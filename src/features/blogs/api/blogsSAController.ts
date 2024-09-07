import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateBlogDto } from './dto/input/create-blog.input.dto';
import { UsersQuery } from '@features/users/api/dto/output/user.output.pagination.dto';
import { UpdateBlogDto } from '@features/blogs/api/dto/input/update-blog.input.dto';
import { PostsQueryRepository } from '@features/posts/infrastructure/posts.query-repository';
import {
  PostOutputPaginationDto,
  PostQuery,
} from '@features/posts/api/dto/output/post.output.pagination.dto';
import { CreatePostForBlogDto } from '@features/blogs/api/dto/input/create-post-for-blog.input.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '@features/blogs/application/handlers/create-blog.handler';
import { UpdateBlogCommand } from '@features/blogs/application/handlers/update-blog.handler';
import { DeleteBlogCommand } from '@features/blogs/application/handlers/delete-blog.handler';
import { GetAllQuery } from '@features/blogs/application/handlers/get-all.handler';
import { BlogOutputPaginationDto } from '@features/blogs/api/dto/output/blog.output.pagination.dto';
import { GetPostForBlogQuery } from '@features/blogs/application/handlers/get-posts-for-blog.handler';
import { GetBlogQuery } from '@features/blogs/application/handlers/get-blog.handler';
import { BasicAuthGuard } from '@infrastructure/guards/basic-auth-guard.service';
import { GetPostQuery } from '@features/posts/application/handlers/get-post.handler';
import { Request } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { CreatePostCommand } from '@features/posts/application/handlers/create-post.handler';
import { UpdatePostCommand } from '@features/posts/application/handlers/update-post.handler';
import { UpdatePostForBlogDto } from '@features/blogs/api/dto/input/update-post-for-blog.input.dto';
import { DeletePostCommand } from '@features/posts/application/handlers/delete-post.handler';

// Tag для swagger
@SkipThrottle()
@ApiTags('Blogs')
@Controller('sa/blogs')
export class BlogsSAController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiSecurity('basic')
  @UseGuards(BasicAuthGuard)
  @Get()
  async getAll(@Query() query: UsersQuery) {
    return await this.queryBus.execute<GetAllQuery, BlogOutputPaginationDto>(
      new GetAllQuery(query),
    );
  }

  @ApiSecurity('basic')
  @UseGuards(BasicAuthGuard)
  @Post()
  async create(@Body() input: CreateBlogDto) {
    const { name, description, websiteUrl } = input;

    const createdBlogId: string = await this.commandBus.execute<
      CreateBlogCommand,
      string
    >(new CreateBlogCommand(name, description, websiteUrl));

    return await this.queryBus.execute<GetBlogQuery, PostOutputPaginationDto>(
      new GetBlogQuery(createdBlogId),
    );
  }

  // @ApiSecurity('bearer')
  // @UseGuards(BearerTokenInterceptorGuard)
  @ApiSecurity('basic')
  @UseGuards(BasicAuthGuard)
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

  @ApiSecurity('basic')
  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() input: CreatePostForBlogDto,
  ) {
    const { title, shortDescription, content } = input;

    const createdPostId: string = await this.commandBus.execute<
      CreatePostCommand,
      string
    >(new CreatePostCommand(title, shortDescription, content, blogId));

    return await this.queryBus.execute<GetPostQuery, PostsQueryRepository>(
      new GetPostQuery(createdPostId),
    );
  }

  @ApiSecurity('basic')
  @UseGuards(BasicAuthGuard)
  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostForBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() input: UpdatePostForBlogDto,
  ) {
    const { title, shortDescription, content } = input;

    await this.commandBus.execute<UpdatePostCommand, void>(
      new UpdatePostCommand(postId, title, shortDescription, content, blogId),
    );
  }

  @ApiSecurity('basic')
  @UseGuards(BasicAuthGuard)
  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostForBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ) {
    await this.commandBus.execute<DeletePostCommand, void>(
      new DeletePostCommand(postId, blogId),
    );
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return await this.queryBus.execute<GetBlogQuery, PostOutputPaginationDto>(
      new GetBlogQuery(id),
    );
  }

  @ApiSecurity('basic')
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() input: UpdateBlogDto) {
    const { name, description, websiteUrl } = input;

    await this.commandBus.execute<UpdateBlogCommand, void>(
      new UpdateBlogCommand(id, name, description, websiteUrl),
    );
  }

  @ApiSecurity('basic')
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    await this.commandBus.execute<DeleteBlogCommand, void>(
      new DeleteBlogCommand(id),
    );
  }
}
