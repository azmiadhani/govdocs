import { getSequelize, Document, AiSummary, ChatMessage } from '~/server/models'

export default defineEventHandler(async () => {
  const sequelize = getSequelize()

  const [docStats, questionsAsked, summaryCount] = await Promise.all([
    sequelize.query<{
      total_documents: string
      total_ministries: string
      total_types: string
      total_pages_indexed: string
    }>(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'indexed') AS total_documents,
        COUNT(DISTINCT ministry) FILTER (WHERE status = 'indexed' AND ministry IS NOT NULL) AS total_ministries,
        COUNT(DISTINCT type) FILTER (WHERE status = 'indexed') AS total_types,
        COALESCE(SUM(page_count) FILTER (WHERE status = 'indexed'), 0) AS total_pages_indexed
      FROM documents`,
      { type: 'SELECT' as any },
    ),
    ChatMessage.count({ where: { role: 'user' } }),
    AiSummary.count(),
  ])

  const row = docStats[0]

  return {
    totalDocuments: parseInt(row.total_documents) || 0,
    totalQuestionsAsked: questionsAsked,
    totalMinistries: parseInt(row.total_ministries) || 0,
    totalTypes: parseInt(row.total_types) || 0,
    totalPagesIndexed: parseInt(row.total_pages_indexed) || 0,
    totalSummaries: summaryCount,
  }
})
