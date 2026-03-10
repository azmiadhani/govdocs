// User & Auth
export type Role = 'admin' | 'editor' | 'viewer'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  createdAt: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
}

export interface JWTPayload extends AuthUser {
  iat?: number
  exp?: number
}

// Documents
export type DocumentStatus = 'pending' | 'indexed' | 'error'
export type DocumentType = 'law' | 'regulation' | 'decree' | 'circular' | 'guideline' | 'other'

export interface Document {
  id: string
  title: string
  type: DocumentType
  ministry: string
  filePath: string
  fileSize: number
  pageCount: number
  publishedAt: string | null
  status: DocumentStatus
  tags: string[]
  uploadedBy: string
  createdAt: string
  // optional joined
  uploader?: Pick<User, 'id' | 'name' | 'email'>
  summary?: AiSummary
}

export interface DocumentListParams {
  search?: string
  type?: DocumentType
  ministry?: string
  status?: DocumentStatus
  page?: number
  limit?: number
  sort?: 'createdAt' | 'publishedAt' | 'title'
  order?: 'ASC' | 'DESC'
}

export interface DocumentListResponse {
  data: Document[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Document Chunks
export interface DocumentChunk {
  id: string
  documentId: string
  content: string
  chunkIndex: number
  pageNumber: number
  embedding?: number[]
}

export interface ChunkSearchResult extends DocumentChunk {
  documentTitle: string
  distance: number
}

// AI Summaries
export interface AiSummary {
  id: string
  documentId: string
  summary: string
  keyPoints: string[]
  modelUsed: string
  generatedAt: string
}

// Chat
export type ChatScope = 'global' | 'document'
export type MessageRole = 'user' | 'assistant'

export interface ChatSession {
  id: string
  userId: string
  scope: ChatScope
  documentId: string | null
  title: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  sessionId: string
  role: MessageRole
  content: string
  sources: ChunkSource[]
  createdAt: string
}

export interface ChunkSource {
  chunkId: string
  documentId: string
  documentTitle: string
  pageNumber: number
  content: string
}

// API Responses
export interface ApiError {
  statusCode: number
  message: string
}

export interface UploadDocumentBody {
  title: string
  type: DocumentType
  ministry: string
  publishedAt?: string
  tags?: string[]
}

export interface ChatRequestBody {
  query: string
  sessionId: string
  documentIds?: string[]
}

export interface SummarizeBody {
  documentId: string
}

export interface ReindexBody {
  documentId: string
}
