import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Comment } from '@features/comments/domain/comment.entity';
import { Blog } from '@features/blogs/domain/blog.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, nullable: false, name: 'title' })
  title: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  short_description: string;

  @Column({ type: 'varchar', length: 1000, nullable: false })
  content: string;

  @Column({ type: 'uuid', nullable: false })
  blog_id: string;

  @Column({ type: 'varchar', nullable: false })
  blog_name: string;

  @CreateDateColumn({
    type: 'timestamptz',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @ManyToOne(() => Blog, (blog) => blog.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blog_id' }) // Используем нотацию через нижнее подчеркивание
  blog?: Blog;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments?: Comment[];
}
