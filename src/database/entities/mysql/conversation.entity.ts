import moment from "moment";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, ObjectIdColumn, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('conversation')
export class Conversation {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number

    @Column({ default: null, type: 'longtext', charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    content: string

    @Index()
    @Column({ type: 'bigint', unsigned: true })
    senderId: number

    @JoinColumn({ name: 'senderId' })
    @ManyToOne(type => User)
    sender: User

    @Index()
    @Column({ type: 'bigint', unsigned: true, nullable: true, default: null })
    receiverId: number

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @Column("timestamp", { precision: 6, default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedAt: Date
}