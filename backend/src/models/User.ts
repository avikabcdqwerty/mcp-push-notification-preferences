import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { NotificationPreference } from './NotificationPreference';
import { Product } from './Product';

/**
 * User entity definition.
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 100 })
  username!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ select: false })
  passwordHash!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @OneToMany(() => NotificationPreference, (pref) => pref.user)
  notificationPreferences!: NotificationPreference[];

  @OneToMany(() => Product, (product) => product.createdBy)
  products!: Product[];
}