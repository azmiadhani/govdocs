import { Op } from 'sequelize'
import { Document, AiSummary, SearchLog, getSequelize } from '~/server/models'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = (query.q as string)?.trim() || ''
  const type = query.type as string | undefined
  const ministry = query.ministry as string | undefined
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(50, parseInt(query.limit as string) || 12)
  const sort = (query.sort as string) || 'newest'
  const offset = (page - 1) * limit

  const where: any = { status: 'indexed' }

  if (q) {
    where[Op.or as any] = [
      { title: { [Op.iLike]: `%${q}%` } },
      { ministry: { [Op.iLike]: `%${q}%` } },
      { type: { [Op.iLike]: `%${q}%` } },
    ]
  }
  if (type) where.type = type
  if (ministry) where.ministry = ministry

  let order: any[] = [['published_at', 'DESC']]
  if (sort === 'oldest') order = [['published_at', 'ASC']]
  else if (sort === 'views') order = [['view_count', 'DESC']]
  else if (sort === 'newest') order = [['published_at', 'DESC']]

  const { count, rows } = await Document.findAndCountAll({
    where,
    order,
    limit,
    offset,
    include: [{ model: AiSummary, as: 'summary', attributes: ['summary', 'keyPoints'], required: false }],
  })

  // Log search query
  if (q) {
    SearchLog.create({ query: q, resultCount: count }).catch(() => {})
  }

  // Available filter options from current (unfiltered by type/ministry) result set
  const sequelize = getSequelize()
  const [availableTypes, availableMinistries] = await Promise.all([
    sequelize.query<{ type: string }>(
      `SELECT DISTINCT type FROM documents WHERE status = 'indexed' ORDER BY type`,
      { type: 'SELECT' as any },
    ),
    sequelize.query<{ ministry: string }>(
      `SELECT DISTINCT ministry FROM documents WHERE status = 'indexed' AND ministry IS NOT NULL ORDER BY ministry`,
      { type: 'SELECT' as any },
    ),
  ])

  return {
    documents: rows,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
    availableTypes: availableTypes.map((r) => r.type),
    availableMinistries: availableMinistries.map((r) => r.ministry),
  }
})
