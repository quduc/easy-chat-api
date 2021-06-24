import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp, Unique } from "typeorm";
import { User } from "./user.entity";

@Entity('favourites')
@Unique("playlist_unique", ["songId", "userId"]) // named; multiple fields
export class Favourite {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  userId: number

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => User)
  user: User

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  songId: number

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @Column("timestamp", { precision: 6, default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  updatedAt: Date

  @Column({ default: false })
  isDeleted: boolean
}