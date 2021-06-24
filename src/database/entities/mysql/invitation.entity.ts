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
} from 'typeorm';
import { Room } from './room.entity';
import { User } from './user.entity';

export enum InvitationStatus {
    PENDING = 'PENDING',
    DECLINED = 'DECLINED',
    ACCEPTED = 'ACCEPTED'
}

@Entity('invitations')
export class Invitation {
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
    senderId: number;

    @JoinColumn({ name: 'senderId' })
    @ManyToOne(type => User)
    sender: User

    @Index()
    @Column({ unsigned: true, type: 'bigint' })
    roomId: number;

    @JoinColumn({ name: 'roomId' })
    @ManyToOne(type => Room)
    room: Room

    @Column({ type: 'enum', default: InvitationStatus.PENDING, enum: InvitationStatus })
    status: InvitationStatus

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @Column("timestamp", { precision: 6, default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedAt: Date

    @Column({ default: false })
    isDeleted: boolean;
}
