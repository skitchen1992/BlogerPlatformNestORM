import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '@features/users/domain/user.entity';
import { Post } from '@features/posts/domain/post.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 300,
  })
  content: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  user_login: string;

  @Column({ type: 'uuid' })
  post_id: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' }) // Устанавливаем связь с таблицей пользователей
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' }) // Устанавливаем связь с таблицей постов
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
