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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @Column({ type: 'varchar', nullable: false })
  confirmation_code: string;

  @Column({ type: 'boolean', nullable: false })
  is_confirmed: boolean;

  @OneToOne(() => User, (user) => user.recoveryCode, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
