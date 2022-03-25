import { Like } from './like.entity';
import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Comment } from './comment.entity';

@Entity('post')
export class Post {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  userId: number

  @Column({ nullable: true, default: null })
  title: string

  @Column({ nullable: true, default: null })
  description: string

  @Column({ nullable: true, default: null })
  category: string

  @Column({ nullable: true, default: null })
  image: string

  @OneToMany(type => Like, like => like.post)
  like: Like

  @OneToMany(type => Comment, comment => comment.post)
  comment: Comment

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date
}
