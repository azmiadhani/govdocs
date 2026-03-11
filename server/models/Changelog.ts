import { Model, DataTypes, type Sequelize } from 'sequelize'

export type ChangelogType = 'feature' | 'improvement' | 'fix' | 'security' | 'breaking'

export class Changelog extends Model {
  declare id: string
  declare version: string
  declare title: string
  declare content: string
  declare type: ChangelogType
  declare published: boolean
  declare releasedAt: string
  declare createdAt: Date
  declare updatedAt: Date
}

export function initChangelog(sequelize: Sequelize) {
  Changelog.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      version: { type: DataTypes.STRING(50), allowNull: false },
      title: { type: DataTypes.STRING(255), allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
      type: {
        type: DataTypes.ENUM('feature', 'improvement', 'fix', 'security', 'breaking'),
        defaultValue: 'feature',
        allowNull: false,
      },
      published: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
      releasedAt: { type: DataTypes.DATEONLY, allowNull: false },
    },
    { sequelize, tableName: 'changelogs', underscored: true },
  )
}
