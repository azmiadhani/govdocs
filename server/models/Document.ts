import { Model, DataTypes, type Sequelize } from 'sequelize'

export class Document extends Model {
  declare id: string
  declare title: string
  declare type: string
  declare ministry: string
  declare filePath: string
  declare fileSize: number
  declare pageCount: number
  declare publishedAt: Date | null
  declare status: 'pending' | 'indexed' | 'error'
  declare tags: string[]
  declare uploadedBy: string
  declare createdAt: Date
  declare updatedAt: Date
}

export function initDocument(sequelize: Sequelize) {
  Document.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      title: { type: DataTypes.TEXT, allowNull: false },
      type: {
        type: DataTypes.ENUM('law', 'regulation', 'decree', 'circular', 'guideline', 'other'),
        allowNull: false,
        defaultValue: 'other',
      },
      ministry: { type: DataTypes.TEXT },
      filePath: { type: DataTypes.TEXT, allowNull: false },
      fileSize: { type: DataTypes.INTEGER, defaultValue: 0 },
      pageCount: { type: DataTypes.INTEGER, defaultValue: 0 },
      publishedAt: { type: DataTypes.DATEONLY, allowNull: true },
      status: { type: DataTypes.ENUM('pending', 'indexed', 'error'), allowNull: false, defaultValue: 'pending' },
      tags: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
      uploadedBy: { type: DataTypes.UUID, allowNull: true },
    },
    { sequelize, tableName: 'documents', underscored: true },
  )
}
