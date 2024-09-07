import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Post } from '@features/posts/domain/post.entity';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 15 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  website_url: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'boolean' })
  is_membership: boolean;

  @OneToMany(() => Post, (post) => post.blog)
  posts?: Post[];
}
