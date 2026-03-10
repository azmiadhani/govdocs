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

@Table({ tableName: 'document_chunks', timestamps: false, underscored: true })
export class DocumentChunk extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string

  @ForeignKey(() => Document)
  @Column({ type: DataType.UUID, allowNull: false })
  declare documentId: string

  @Column({ type: DataType.TEXT, allowNull: false })
  declare content: string

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare chunkIndex: number

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare pageNumber: number

  // pgvector column — stored via raw SQL in migration
  // queried via sequelize.query() for cosine similarity
  @Column({ type: 'vector(1536)' as any })
  declare embedding: number[]

  @BelongsTo(() => Document)
  declare document: Document
}
