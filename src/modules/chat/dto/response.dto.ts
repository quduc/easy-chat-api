import { Timestamp } from "typeorm"
import { Conversation } from "../../../database/entities/mysql/conversation.entity"
import { User } from "../../../database/entities/mysql/user.entity"

export class DetailMessageDto {
  id: number
  sender: User
  content: string
  metadata?: string
  senderId: number
  receiverId?: number
  receiver?: User
  roomId: number
  createdAt: Date
  isDeleted: boolean

  constructor(entity: Conversation) {
    this.id = entity.id
    this.sender = entity.sender
    this.senderId = entity.senderId
    this.content = entity.content
    this.receiverId = entity.receiverId
    this.createdAt = entity.createdAt
    delete (this.sender.email)
    delete (this.sender.password)
    delete (this.sender.updatedAt)
  }
}