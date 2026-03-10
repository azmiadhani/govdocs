import 'reflect-metadata'
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  HasOne,
} from 'sequelize-typescript'
import { User } from './User'

@Table({ tableName: 'documents', underscored: true })
export class Document extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string

  @Column({ type: DataType.TEXT, allowNull: false })
  declare title: string

  @Column({
    type: DataType.ENUM('law', 'regulation', 'decree', 'circular', 'guideline', 'other'),
    allowNull: false,
    defaultValue: 'other',
  })
  declare type: string

  @Column({ type: DataType.TEXT })
  declare ministry: string

  @Column({ type: DataType.TEXT, allowNull: false })
  declare filePath: string

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare fileSize: number

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare pageCount: number

  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare publishedAt: Date | null

  @Column({
    type: DataType.ENUM('pending', 'indexed', 'error'),
    defaultValue: 'pending',
  })
  declare status: string

  @Column({ type: DataType.ARRAY(DataType.TEXT), defaultValue: [] })
  declare tags: string[]

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  declare uploadedBy: string

  @BelongsTo(() => User)
  declare uploader: User

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare createdAt: Date

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare updatedAt: Date
}
