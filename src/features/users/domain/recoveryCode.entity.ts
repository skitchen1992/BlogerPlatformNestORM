import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '@features/users/domain/user.entity';

@Entity('recovery_code')
export class RecoveryCode {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar' })
  confirmation_code: string;

  @Column({ type: 'boolean' })
  is_confirmed: boolean;

  @OneToOne(() => User, (user) => user.recoveryCode, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
