import { Model, DataTypes, type Sequelize } from 'sequelize'

export class ChatSession extends Model {
  declare id: string
  declare userId: string
  declare scope: 'global' | 'document'
  declare documentId: string | null
  declare title: string
  declare createdAt: Date
  declare updatedAt: Date
}

export function initChatSession(sequelize: Sequelize) {
  ChatSession.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      scope: { type: DataTypes.ENUM('global', 'document'), allowNull: false, defaultValue: 'global' },
      documentId: { type: DataTypes.UUID, allowNull: true },
      title: { type: DataTypes.TEXT },
    },
    { sequelize, tableName: 'chat_sessions', underscored: true },
  )
}
