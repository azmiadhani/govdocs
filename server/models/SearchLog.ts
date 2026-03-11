import { Model, DataTypes, type Sequelize } from 'sequelize'

export class SearchLog extends Model {
  declare id: string
  declare query: string
  declare resultCount: number
  declare createdAt: Date
}

export function initSearchLog(sequelize: Sequelize) {
  SearchLog.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      query: { type: DataTypes.TEXT, allowNull: false },
      resultCount: { type: DataTypes.INTEGER, defaultValue: 0 },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { sequelize, tableName: 'search_logs', underscored: true, updatedAt: false },
  )
}
