import { Post } from './post.entity';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('like')
export class Like {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number

    @JoinColumn({ name: 'postId' })
    @ManyToOne(type => Post)
    post: Post

    @Column()
    postId: number


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