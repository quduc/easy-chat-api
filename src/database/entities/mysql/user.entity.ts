import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  PrimaryGeneratedColumn,
  Timestamp,
  OneToMany
} from 'typeorm';
import * as bcrypt from 'bcrypt'
import { AppConfig } from '../../../common/constants/app-config';
import { Exclude } from 'class-transformer';
import { Post } from './post.entity';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ unsigned: true, type: 'bigint' })
  id: number;

  @Column({ nullable: true, length: 50, charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
  name: string;

  @Column({ length: 255, nullable: true, unique: true })
  email: string;

  @Column({ nullable: true, length: 255 })
  password: string;

  @Column({ nullable: true, length: 255 })
  avatar: string;

  @Column({ nullable: true, length: 255 })
  birthday: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column("timestamp", { precision: 6, default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  updatedAt: Date;

  @Column({ nullable: true, length: 255 })
  description: string

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      const hashString = await bcrypt.hash(this.password, AppConfig.SALT_ROUND)
      this.password = hashString
    }
  }

  @BeforeUpdate()
  async removePassword() {
    delete (this.password)
  }

  @OneToMany(type => Post, post => post.user)
  posts: Post[];
}
