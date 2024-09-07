import { Module, Provider } from '@nestjs/common';
import { SharedModule } from '../../modules/shared.module';
import { LikesRepository } from '@features/likes/infrastructure/likes.repository';
import { LikeOperationHandler } from '@features/posts/application/handlers/like-operation.handler';

const likesProviders: Provider[] = [LikesRepository, LikeOperationHandler];

@Module({
  imports: [
    //TypeOrmModule.forFeature([Like]),
    SharedModule,
    // forwardRef(() => BlogsModule),
  ],
  providers: [...likesProviders],
  controllers: [],
  // exports: [CommentsRepository, CommentsQueryRepository],
})
export class LikesModule {}
