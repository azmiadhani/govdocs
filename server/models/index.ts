import 'reflect-metadata'
import { Sequelize } from 'sequelize-typescript'
import { User } from './User'
import { Document } from './Document'
import { DocumentChunk } from './DocumentChunk'
import { AiSummary } from './AiSummary'
import { ChatSession } from './ChatSession'
import { ChatMessage } from './ChatMessage'

let sequelizeInstance: Sequelize | null = null

export function getSequelize(): Sequelize {
  if (sequelizeInstance) return sequelizeInstance

  const config = useRuntimeConfig()

  sequelizeInstance = new Sequelize({
    dialect: 'postgres',
    ...(config.databaseUrl
      ? { url: config.databaseUrl }
      : {
          host: config.dbHost || process.env.DB_HOST,
          port: Number(config.dbPort || process.env.DB_PORT || 5432),
          database: config.dbName || process.env.DB_NAME,
          username: config.dbUser || process.env.DB_USER,
          password: config.dbPass || process.env.DB_PASS,
        }),
    models: [User, Document, DocumentChunk, AiSummary, ChatSession, ChatMessage],
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 10, min: 0, idle: 10000 },
  })

  return sequelizeInstance
}

// Convenience export — resolved lazily to avoid top-level await issues
export { User, Document, DocumentChunk, AiSummary, ChatSession, ChatMessage }
