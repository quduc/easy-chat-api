import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Room } from "./room.entity";
import { User } from "./user.entity";

@Entity('room_members')
export class RoomMember {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number

    @Index()
    @Column({ type: 'bigint', unsigned: true })
    userId: number

    @JoinColumn({ name: 'userId' })
    @ManyToOne(type => User)
    user: User

    @Index()
    @Column({ type: 'bigint', unsigned: true })
    roomId: number

    @JoinColumn({ name: 'roomId' })
    @ManyToOne(type => Room)
    room: Room

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @Column("timestamp", { precision: 6, default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedAt: Date

    @Column({ default: false })
    isLeave: boolean
}