import { Post } from './post.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('comment')
export class Comment {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number

    @JoinColumn({ name: 'postId' })
    @ManyToOne(type => Post)
    post: Post

    @Column()
    postId: number

    @Column({ nullable: false })
    content: string

    @JoinColumn({ name: 'userId' })
    @ManyToOne(() => User)
    user: User

    @Column()
    userId: number

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @Column("timestamp", { precision: 6, default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedAt: Date

    @Column({ default: false })
    isDeleted: boolean
}