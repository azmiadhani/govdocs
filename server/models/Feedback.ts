import { Model, DataTypes, type Sequelize } from 'sequelize'

export type FeedbackStatus = 'unread' | 'read' | 'replied'

export class Feedback extends Model {
  declare id: string
  declare name: string
  declare email: string
  declare subject: string
  declare message: string
  declare status: FeedbackStatus
  declare createdAt: Date
}

export function initFeedback(sequelize: Sequelize) {
  Feedback.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      email: { type: DataTypes.STRING(255), allowNull: false },
      subject: { type: DataTypes.STRING(255), allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
      status: {
        type: DataTypes.ENUM('unread', 'read', 'replied'),
        defaultValue: 'unread',
        allowNull: false,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { sequelize, tableName: 'feedback', underscored: true, updatedAt: false },
  )
}
