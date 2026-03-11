import { ChatSession, getSequelize } from '~/server/models'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  getSequelize()

  const id = getRouterParam(event, 'id')
  const { title } = await readBody(event)

  const session = await ChatSession.findOne({ where: { id, userId: user.id } })
  if (!session) throw createError({ statusCode: 404, message: 'Session not found' })

  await session.update({ title })
  return { session }
})
