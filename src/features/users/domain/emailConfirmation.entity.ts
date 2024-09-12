import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@features/users/domain/user.entity';

@Entity('email_confirmation')
export class EmailConfirmation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_confirmed: boolean;

  @Column({ type: 'varchar', nullable: false })
  confirmation_code: string;

  @Column({ type: 'timestamptz', nullable: false })
  expiration_date: Date;

  @OneToOne(() => User, (user) => user.emailConfirmation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
