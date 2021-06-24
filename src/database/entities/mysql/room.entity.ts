import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { RoomMember } from "./room_member.entity";
import { User } from "./user.entity";

export enum RoomType {
    PRIVATE = 'PRIVATE',
    PUBLIC = 'PUBLIC'
}

export enum SkipRuleType {
    MAJORITY = 'MAJORITY',
    ALL = 'ALL'
}

export enum RoomMode {
    TOURNAMENT = 'TOURNAMENT',
    NORMAL = 'NORMAL'
}

@Entity('rooms')
export class Room {
    @PrimaryGeneratedColumn({ unsigned: true, type: 'bigint' })
    id: number;

    @Column({ nullable: false, length: 300, charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    name: string;

    @Column({ nullable: false })
    number: number;

    @Column({ default: RoomType.PUBLIC, type: 'enum', enum: RoomType })
    type: RoomType;

    @Index()
    @Column({ unsigned: true, type: 'bigint' })
    hostId: number;

    @Column({ unique: true })
    code: string

    @Column({ default: null, type: 'longtext', charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
    description: string

    @Column({ nullable: true })
    cover: string

    @Column({ type: 'enum', enum: SkipRuleType, default: SkipRuleType.MAJORITY })
    skipRule: SkipRuleType

    @Column({ type: 'enum', enum: RoomMode, default: RoomMode.NORMAL })
    mode: RoomMode

    @JoinColumn({ name: 'hostId' })
    @ManyToOne(type => User)
    host: User

    @OneToMany(type => RoomMember, roomMember => roomMember.room)
    members: RoomMember

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @Column("timestamp", { precision: 6, default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedAt: Date

    @Column({ default: false })
    isEnd: boolean;
}