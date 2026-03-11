import { Model, DataTypes, type Sequelize } from 'sequelize'
import type { ChunkSource } from '~/types'

export class ChatMessage extends Model {
  declare id: string
  declare sessionId: string
  declare role: 'user' | 'assistant'
  declare content: string
  declare sources: ChunkSource[]
  declare createdAt: Date
}

export function initChatMessage(sequelize: Sequelize) {
  ChatMessage.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      sessionId: { type: DataTypes.UUID, allowNull: false },
      role: { type: DataTypes.ENUM('user', 'assistant'), allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
      sources: { type: DataTypes.JSONB, defaultValue: [] },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { sequelize, tableName: 'chat_messages', underscored: true, timestamps: false },
  )
}
