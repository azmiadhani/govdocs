import { Changelog } from '~/server/models'
import { cacheGet, cacheSet } from '~/server/utils/redis'

const CACHE_KEY = 'public:changelog'
const CACHE_TTL = 3600

export default defineEventHandler(async () => {
  const cached = await cacheGet(CACHE_KEY)
  if (cached) return cached

  const entries = await Changelog.findAll({
    where: { published: true },
    order: [['releasedAt', 'DESC'], ['createdAt', 'DESC']],
  })

  const result = entries.map(e => e.toJSON())
  await cacheSet(CACHE_KEY, result, CACHE_TTL)
  return result
})
