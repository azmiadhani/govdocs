import { requireRole } from '~/server/utils/auth'
import { Changelog } from '~/server/models'
import { cacheDel } from '~/server/utils/redis'

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const entry = await Changelog.findByPk(id)
  if (!entry) throw createError({ statusCode: 404, message: 'Entry tidak ditemukan' })

  const { version, title, content, type, published, releasedAt } = body
  await entry.update({
    ...(version !== undefined && { version: version.trim() }),
    ...(title !== undefined && { title: title.trim() }),
    ...(content !== undefined && { content: content.trim() }),
    ...(type !== undefined && { type }),
    ...(published !== undefined && { published }),
    ...(releasedAt !== undefined && { releasedAt }),
  })

  await cacheDel('public:changelog')
  return entry.toJSON()
})
