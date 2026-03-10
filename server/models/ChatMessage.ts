import 'reflect-metadata'
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript'
import { ChatSession } from './ChatSession'
import type { ChunkSource } from '~/types'

@Table({ tableName: 'chat_messages', timestamps: false, underscored: true })
export class ChatMessage extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string

  @ForeignKey(() => ChatSession)
  @Column({ type: DataType.UUID, allowNull: false })
  declare sessionId: string

  @Column({
    type: DataType.ENUM('user', 'assistant'),
    allowNull: false,
  })
  declare role: 'user' | 'assistant'

  @Column({ type: DataType.TEXT, allowNull: false })
  declare content: string

  @Column({ type: DataType.JSONB, defaultValue: [] })
  declare sources: ChunkSource[]

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare createdAt: Date

  @BelongsTo(() => ChatSession)
  declare session: ChatSession
}
