import { Model, DataTypes, type Sequelize } from 'sequelize'

export class DocumentChunk extends Model {
  declare id: string
  declare documentId: string
  declare content: string
  declare chunkIndex: number
  declare pageNumber: number
  declare embedding: number[]
}

export function initDocumentChunk(sequelize: Sequelize) {
  DocumentChunk.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      documentId: { type: DataTypes.UUID, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
      chunkIndex: { type: DataTypes.INTEGER, allowNull: false },
      pageNumber: { type: DataTypes.INTEGER, defaultValue: 0 },
      // pgvector column — queried via sequelize.query() for cosine similarity
      embedding: { type: 'vector(1536)' as any },
    },
    { sequelize, tableName: 'document_chunks', underscored: true, timestamps: false },
  )
}
