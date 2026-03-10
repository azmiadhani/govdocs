import { Op } from 'sequelize'
import { Document, User, getSequelize } from '~/server/models'
import { requireAuth } from '~/server/utils/auth'
import { cacheGet, cacheSet } from '~/server/utils/redis'
import type { DocumentListParams } from '~/types'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  getSequelize()

  const query = getQuery(event) as DocumentListParams
  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 20, 100)
  const offset = (page - 1) * limit

  const cacheKey = `docs:list:${JSON.stringify(query)}`
  const cached = await cacheGet(cacheKey)
  if (cached) return cached

  const where: Record<string, unknown> = {}
  if (query.type) where.type = query.type
  if (query.ministry) where.ministry = query.ministry
  if (query.status) where.status = query.status
  if (query.search) {
    where.title = { [Op.iLike]: `%${query.search}%` }
  }

  const { count, rows } = await Document.findAndCountAll({
    where,
    include: [{ model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }],
    order: [[query.sort || 'createdAt', query.order || 'DESC']],
    limit,
    offset,
  })

  const result = {
    data: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  }

  await cacheSet(cacheKey, result, 300) // 5 min cache
  return result
})
