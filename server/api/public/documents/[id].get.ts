import { Op } from 'sequelize'
import { Document, AiSummary } from '~/server/models'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  const doc = await Document.findByPk(id, {
    include: [{ model: AiSummary, as: 'summary', required: false }],
  })

  if (!doc) {
    throw createError({ statusCode: 404, message: 'Dokumen tidak ditemukan' })
  }

  // Increment view count (fire-and-forget)
  Document.increment('viewCount', { where: { id } }).catch(() => {})

  // Related documents: same type or ministry, exclude self
  const related = await Document.findAll({
    where: {
      id: { [Op.ne]: id },
      status: 'indexed',
      [Op.or]: [
        { type: doc.type },
        ...(doc.ministry ? [{ ministry: doc.ministry }] : []),
      ],
    },
    limit: 4,
    order: [['published_at', 'DESC']],
    attributes: ['id', 'title', 'type', 'ministry', 'publishedAt'],
  })

  const summary = (doc as any).summary as AiSummary | null

  return {
    document: doc,
    summary: summary?.summary ?? null,
    keyPoints: summary?.keyPoints ?? null,
    relatedDocuments: related,
  }
})
