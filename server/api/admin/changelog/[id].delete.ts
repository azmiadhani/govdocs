import { requireRole } from '~/server/utils/auth'
import { Changelog } from '~/server/models'
import { cacheDel } from '~/server/utils/redis'

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')

  const id = getRouterParam(event, 'id')
  const entry = await Changelog.findByPk(id)
  if (!entry) throw createError({ statusCode: 404, message: 'Entry tidak ditemukan' })

  await entry.destroy()
  await cacheDel('public:changelog')
  return { success: true }
})
