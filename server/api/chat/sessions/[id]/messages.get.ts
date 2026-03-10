import { ChatSession, ChatMessage, getSequelize } from '~/server/models'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  getSequelize()

  const id = getRouterParam(event, 'id')

  const session = await ChatSession.findOne({ where: { id, userId: user.id } })
  if (!session) throw createError({ statusCode: 404, message: 'Session not found' })

  const messages = await ChatMessage.findAll({
    where: { sessionId: id },
    order: [['createdAt', 'ASC']],
  })

  return { messages }
})
