import 'reflect-metadata'
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript'
import { Document } from './Document'

@Table({ tableName: 'ai_summaries', timestamps: false, underscored: true })
export class AiSummary extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string

  @ForeignKey(() => Document)
  @Column({ type: DataType.UUID, unique: true, allowNull: false })
  declare documentId: string

  @Column({ type: DataType.TEXT, allowNull: false })
  declare summary: string

  @Column({ type: DataType.JSONB, defaultValue: [] })
  declare keyPoints: string[]

  @Column({ type: DataType.TEXT })
  declare modelUsed: string

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare generatedAt: Date

  @BelongsTo(() => Document)
  declare document: Document
}
