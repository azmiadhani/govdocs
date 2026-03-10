import 'reflect-metadata'
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript'
import { User } from './User'
import { Document } from './Document'

@Table({ tableName: 'chat_sessions', underscored: true })
export class ChatSession extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string

  @Column({
    type: DataType.ENUM('global', 'document'),
    allowNull: false,
    defaultValue: 'global',
  })
  declare scope: 'global' | 'document'

  @ForeignKey(() => Document)
  @Column({ type: DataType.UUID, allowNull: true })
  declare documentId: string | null

  @Column({ type: DataType.TEXT })
  declare title: string

  @BelongsTo(() => User)
  declare user: User

  @BelongsTo(() => Document)
  declare document: Document

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare createdAt: Date

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare updatedAt: Date
}
