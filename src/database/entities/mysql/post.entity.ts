import { Like } from './like.entity';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, JoinTable, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Comment } from './comment.entity';
import { User } from './user.entity';

@Entity('post')
export class Post {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  userId: number

  @Index({ fulltext: true })
  @Column({ nullable: true, default: null })
  title: string

  @Index({ fulltext: true })
  @Column({ nullable: true, default: null, type: 'varchar', length: 2000 })
  description: string

  @Index({ fulltext: true })
  @Column({ nullable: true, default: null })
  category: string

  @Column({ nullable: true, default: null })
  image: string

  @OneToMany(type => Like, like => like.post)
  like: Like

  @ManyToOne(type => User, user => user.posts)
  user: User;

  @OneToMany(type => Comment, comment => comment.post)
  comment: Comment

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date
}
