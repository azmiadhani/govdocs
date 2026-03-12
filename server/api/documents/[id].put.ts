import { Document, getSequelize } from '~/server/models'
import { requireRole } from '~/server/utils/auth'
import { cacheDelPattern, cacheDel } from '~/server/utils/redis'

export default defineEventHandler(async (event) => {
  await requireRole(event, 'editor')
  getSequelize()

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const doc = await Document.findByPk(id)
  if (!doc) throw createError({ statusCode: 404, message: 'Document not found' })

  const allowed = ['title', 'type', 'ministry', 'publishedAt', 'tags'] as const
  for (const field of allowed) {
    if (body[field] !== undefined) {
      ;(doc as any)[field] = body[field]
    }
  }

  await doc.save()
  await cacheDelPattern('docs:list:*')
  await cacheDelPattern('public:docs:list:*')
  await cacheDel(`public:doc:${id}`)

  return { document: doc }
})
