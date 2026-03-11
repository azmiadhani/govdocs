import { Sequelize } from 'sequelize'
import { User, initUser } from './User'
import { Document, initDocument } from './Document'
import { DocumentChunk, initDocumentChunk } from './DocumentChunk'
import { AiSummary, initAiSummary } from './AiSummary'
import { ChatSession, initChatSession } from './ChatSession'
import { ChatMessage, initChatMessage } from './ChatMessage'

let sequelizeInstance: Sequelize | null = null

export function getSequelize(): Sequelize {
  if (sequelizeInstance) return sequelizeInstance

  const databaseUrl = process.env.DATABASE_URL
  const options = {
    dialect: 'postgres' as const,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 10, min: 0, idle: 10000 },
  }

  sequelizeInstance = databaseUrl
    ? new Sequelize(databaseUrl, options)
    : new Sequelize({
        ...options,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
      })

  // Init all models
  initUser(sequelizeInstance)
  initDocument(sequelizeInstance)
  initDocumentChunk(sequelizeInstance)
  initAiSummary(sequelizeInstance)
  initChatSession(sequelizeInstance)
  initChatMessage(sequelizeInstance)

  // Associations
  User.hasMany(Document, { foreignKey: 'uploadedBy', as: 'documents' })
  Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' })

  Document.hasMany(DocumentChunk, { foreignKey: 'documentId', as: 'chunks' })
  DocumentChunk.belongsTo(Document, { foreignKey: 'documentId', as: 'document' })

  Document.hasOne(AiSummary, { foreignKey: 'documentId', as: 'summary' })
  AiSummary.belongsTo(Document, { foreignKey: 'documentId', as: 'document' })

  User.hasMany(ChatSession, { foreignKey: 'userId', as: 'sessions' })
  ChatSession.belongsTo(User, { foreignKey: 'userId', as: 'user' })
  ChatSession.belongsTo(Document, { foreignKey: 'documentId', as: 'document' })

  ChatSession.hasMany(ChatMessage, { foreignKey: 'sessionId', as: 'messages' })
  ChatMessage.belongsTo(ChatSession, { foreignKey: 'sessionId', as: 'session' })

  return sequelizeInstance
}

export { User, Document, DocumentChunk, AiSummary, ChatSession, ChatMessage }
