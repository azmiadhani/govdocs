import { ChatSession, getSequelize } from '~/server/models'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  getSequelize()

  const { scope = 'global', documentId = null, title = 'New Chat' } = await readBody(event)

  const session = await ChatSession.create({
    userId: user.id,
    scope,
    documentId: documentId || null,
    title,
  })

  return { session }
})
