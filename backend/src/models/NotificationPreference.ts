import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './User';

/**
 * NotificationPreference entity definition.
 * Stores encrypted preferences for a user.
 */
@Entity()
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column()
  userId!: string;

  @ManyToOne(() => User, (user) => user.notificationPreferences, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ type: 'text' })
  encryptedPreferences!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}