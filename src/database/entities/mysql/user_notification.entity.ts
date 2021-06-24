import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { User } from "./user.entity";

@Entity('user_notification')
export class UserNotification {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @Column("timestamp", { precision: 6, default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedAt: Date

    @Column({ type: 'bigint', unsigned: true })
    userId: number

    @ManyToOne(type => User)
    @JoinColumn({ name: 'userId' })
    user: User

    @Column({ default: true })
    showFriendRequest: boolean

    @Column({ default: true })
    showAcceptedRequest: boolean

    @Column({ default: true })
    showFriendActivities: boolean

    @Column({ default: true })
    showFollowActivities: boolean

    @Column({ default: true })
    showInvitation: boolean
}