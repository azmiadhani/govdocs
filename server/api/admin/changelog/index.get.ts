import { requireRole } from '~/server/utils/auth'
import { Changelog } from '~/server/models'

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')

  const entries = await Changelog.findAll({
    order: [['releasedAt', 'DESC'], ['createdAt', 'DESC']],
  })

  return entries.map(e => e.toJSON())
})
