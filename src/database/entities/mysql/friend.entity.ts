import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    Timestamp,
    Index,
    JoinColumn,
    ManyToOne,
    Unique
} from 'typeorm';
import { User } from './user.entity';

export enum FriendStatus {
    PENDING = 'PENDING',
    FRIEND = 'FRIEND',
    DECLINED = 'DECLINED',
    FOLLOWED = 'FOLLOWED',
    BLOCKED = 'BLOCKED'
}

@Entity('friends')
@Unique("friend_unique", ["friendId", "userId"]) // named; multiple fields
export class Friend {
    @PrimaryGeneratedColumn({ unsigned: true, type: 'bigint' })
    id: number;

    @Index()
    @Column({ unsigned: true, type: 'bigint' })
    userId: number;

    @JoinColumn({ name: 'userId' })
    @ManyToOne(type => User)
    user: User

    @Index()
    @Column({ unsigned: true, type: 'bigint' })
    friendId: number;

    @JoinColumn({ name: 'friendId' })
    @ManyToOne(type => User)
    friend: User

    @Column({ nullable: true, enum: FriendStatus, type: 'enum' })
    status: FriendStatus

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @Column("timestamp", { precision: 6, default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedAt: Date

    @Column({ default: false })
    isDeleted: boolean;

    @Column({ nullable: true, default: false })
    isFollowed: boolean
}
