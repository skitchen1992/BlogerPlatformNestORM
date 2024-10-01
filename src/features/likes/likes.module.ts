import { Module, Provider } from '@nestjs/common';
import { SharedModule } from '../../modules/shared.module';
import { LikesRepository } from '@features/likes/infrastructure/likes.repository';
import { LikeOperationHandler } from '@features/posts/application/handlers/like-operation.handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from '@features/likes/domain/likes.entity';

const likesProviders: Provider[] = [LikesRepository, LikeOperationHandler];

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([Like])],
  providers: [...likesProviders],
  controllers: [],
})
export class LikesModule {}
