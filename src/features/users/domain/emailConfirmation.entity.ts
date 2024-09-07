import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@features/users/domain/user.entity';

@Entity('email_confirmations')
export class EmailConfirmation {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id?: number;

  @Column({ type: 'uuid' })
  user_id?: string;

  @Column({ type: 'boolean', default: false })
  is_confirmed: boolean;

  @Column({ type: 'varchar' })
  confirmation_code: string;

  @Column({ type: 'timestamptz' })
  expiration_date: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
