import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { User } from "./user.entity";

export enum DeviceType {
    IOS = 'IOS',
    ANDROID = 'ANDROID',
    BROWSER = 'BROWSER',
    OTHER = 'OTHER'
}

@Entity('user_devices')
export class UserDevice {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number

    @Column()
    token: string

    @Column({ type: 'enum', enum: DeviceType, default: DeviceType.OTHER })
    platform: DeviceType

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @Column({ type: 'bigint', unsigned: true })
    userId: number

    @ManyToOne(type => User)
    @JoinColumn({ name: 'userId' })
    user: User

    @Column({ default: false })
    isDeleted: boolean
}