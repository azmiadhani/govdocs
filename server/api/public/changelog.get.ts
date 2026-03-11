import { Changelog } from '~/server/models'

export default defineEventHandler(async () => {
  const entries = await Changelog.findAll({
    where: { published: true },
    order: [['releasedAt', 'DESC'], ['createdAt', 'DESC']],
  })

  return entries.map(e => e.toJSON())
})
