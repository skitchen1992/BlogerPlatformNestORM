import { forwardRef, Module, Provider } from '@nestjs/common';
import { SharedModule } from '../../modules/shared.module';
import { BlogsRepository } from '@features/blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from '@features/blogs/infrastructure/blogs.query-repository';
import { BlogsService } from '@features/blogs/application/blogs.service';
import { CreateBlogHandler } from '@features/blogs/application/handlers/create-blog.handler';
import { UpdateBlogHandler } from '@features/blogs/application/handlers/update-blog.handler';
import { DeleteBlogHandler } from '@features/blogs/application/handlers/delete-blog.handler';
import { GetAllHandler } from '@features/blogs/application/handlers/get-all.handler';
import { GetPostForBlogHandler } from '@features/blogs/application/handlers/get-posts-for-blog.handler';
import { GetBlogHandler } from '@features/blogs/application/handlers/get-blog.handler';
import { BlogsSAController } from '@features/blogs/api/blogsSAController';
import { PostsModule } from '@features/posts/posts.module';
import { UsersModule } from '@features/users/users.module';
import { CreatePostHandler } from '@features/posts/application/handlers/create-post.handler';
import { UpdatePostHandler } from '@features/posts/application/handlers/update-post.handler';
import { DeletePostHandler } from '@features/posts/application/handlers/delete-post.handler';
import { BlogsController } from '@features/blogs/api/blogsController';

const blogsProviders: Provider[] = [
  BlogsRepository,
  BlogsQueryRepository,
  BlogsService,
  CreateBlogHandler,
  CreatePostHandler,
  UpdatePostHandler,
  UpdateBlogHandler,
  DeletePostHandler,
  DeleteBlogHandler,
  GetAllHandler,
  GetPostForBlogHandler,
  GetBlogHandler,
];

@Module({
  imports: [
    SharedModule,
    forwardRef(() => PostsModule),
    forwardRef(() => UsersModule),
  ],
  providers: [...blogsProviders],
  controllers: [BlogsSAController, BlogsController],
  exports: [BlogsRepository, BlogsQueryRepository],
})
export class BlogsModule {}
