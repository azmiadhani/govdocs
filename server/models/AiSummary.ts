import { Model, DataTypes, type Sequelize } from 'sequelize'

export class AiSummary extends Model {
  declare id: string
  declare documentId: string
  declare summary: string
  declare keyPoints: string[]
  declare modelUsed: string
  declare generatedAt: Date
}

export function initAiSummary(sequelize: Sequelize) {
  AiSummary.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      documentId: { type: DataTypes.UUID, unique: true, allowNull: false },
      summary: { type: DataTypes.TEXT, allowNull: false },
      keyPoints: { type: DataTypes.JSONB, defaultValue: [] },
      modelUsed: { type: DataTypes.TEXT },
      generatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { sequelize, tableName: 'ai_summaries', underscored: true, timestamps: false },
  )
}
