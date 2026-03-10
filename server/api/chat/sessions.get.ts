import { ChatSession, getSequelize } from '~/server/models'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  getSequelize()

  const sessions = await ChatSession.findAll({
    where: { userId: user.id },
    order: [['updatedAt', 'DESC']],
    limit: 50,
  })

  return { sessions }
})
