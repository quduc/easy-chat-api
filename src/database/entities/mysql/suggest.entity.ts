import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Room } from "./room.entity";
import { User } from "./user.entity";

@Entity('suggests')
export class Suggest {
    @PrimaryGeneratedColumn({ unsigned: true, type: 'bigint' })
    id: number;

    @Index()
    @Column({ unsigned: true, type: 'bigint' })
    roomId: number;

    @JoinColumn({ name: 'roomId' })
    @ManyToOne(type => Room)
    room: Room

    @Index()
    @Column({ unsigned: true, type: 'bigint' })
    userId: number;

    @JoinColumn({ name: 'userId' })
    @ManyToOne(type => User)
    user: User

    @Index()
    @Column({ unsigned: true, type: 'bigint' })
    songId: number;

    @Column({ type: 'int', default: 1, width: 1 })
    status: number; // 1: pending, 2: play, 3: skip, 4: done

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @Column("timestamp", { precision: 6, default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedAt: Date

    @Column({ default: false })
    isDeleted: boolean;

}