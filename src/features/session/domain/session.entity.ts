import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@features/users/domain/user.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  ip: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'timestamptz', nullable: false })
  last_active_date: Date;

  @Column({ type: 'timestamptz', nullable: false })
  token_issue_date: Date;

  @Column({ type: 'timestamptz', nullable: false })
  token_expiration_date: Date;

  @Column({ type: 'uuid', nullable: false })
  device_id: string;

  @ManyToOne(() => User, (user) => user.sessions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
