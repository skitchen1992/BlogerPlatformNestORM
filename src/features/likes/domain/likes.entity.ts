import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@features/users/domain/user.entity';

export enum LikeStatusEnum {
  LIKE = 'Like',
  DISLIKE = 'Dislike',
  NONE = 'None',
}

export enum ParentTypeEnum {
  POST = 'Post',
  COMMENT = 'Comment',
}
@Entity('likes')
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    type: 'timestamptz',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({ type: 'varchar', length: 10, default: 'None', nullable: false })
  status: LikeStatusEnum;

  @Column({ type: 'uuid', nullable: false })
  author_id: string;

  @Column({ type: 'uuid', nullable: false })
  parent_id: string;

  @Column({ type: 'varchar', length: 10 })
  parent_type: ParentTypeEnum;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;
}
