import { requireRole } from '~/server/utils/auth'
import { Changelog } from '~/server/models'
import { cacheDel } from '~/server/utils/redis'

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')

  const body = await readBody(event)
  const { version, title, content, type, published, releasedAt } = body

  if (!version?.trim() || !title?.trim() || !content?.trim() || !releasedAt) {
    throw createError({ statusCode: 400, message: 'version, title, content, dan releasedAt wajib diisi' })
  }

  const entry = await Changelog.create({
    version: version.trim(),
    title: title.trim(),
    content: content.trim(),
    type: type || 'feature',
    published: published ?? false,
    releasedAt,
  })

  await cacheDel('public:changelog')
  return entry.toJSON()
})
