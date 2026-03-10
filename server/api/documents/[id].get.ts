import { Document, User, AiSummary, getSequelize } from '~/server/models'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  getSequelize()

  const id = getRouterParam(event, 'id')

  const doc = await Document.findByPk(id, {
    include: [
      { model: User, as: 'uploader', attributes: ['id', 'name', 'email'] },
      { model: AiSummary, as: 'summary' },
    ],
  })

  if (!doc) throw createError({ statusCode: 404, message: 'Document not found' })

  return { document: doc }
})
