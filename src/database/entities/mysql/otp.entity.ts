import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

export enum OtpStatus {
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    DONE = 'DONE',
    EXPIRED = 'EXPIRED'
}

export enum OtpType {
    RESET_PASSWORD = 'RESET_PASSWORD'
}
@Entity('otps')
export class OTP {
    @PrimaryGeneratedColumn({ unsigned: true, type: 'bigint' })
    id: number

    @Index()
    @Column({ unsigned: true, type: 'bigint' })
    userId: number

    @JoinColumn({ name: 'userId' })
    @ManyToOne(type => User)
    user: User

    @Column()
    otp: string

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @Column("timestamp", { precision: 6, default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedAt: Date

    @Column({ nullable: true, type: 'timestamp' })
    expiredAt: Date

    @Column({ type: 'enum', enum: OtpType, nullable: true })
    type: OtpType

    @Column({ type: 'enum', enum: OtpStatus, nullable: true, default: OtpStatus.PENDING })
    status: OtpStatus
}