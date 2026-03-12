import { requireRole } from '~/server/utils/auth'
import { Feedback } from '~/server/models'

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')

  try {
    const query = getQuery(event)
    const status = query.status as string | undefined
    const page = Math.max(1, parseInt(query.page as string) || 1)
    const limit = Math.min(50, parseInt(query.limit as string) || 20)
    const offset = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status

    const [{ count, rows }, unreadCount] = await Promise.all([
      Feedback.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      }),
      Feedback.count({ where: { status: 'unread' } }),
    ])

    return {
      items: rows.map(f => f.toJSON()),
      total: count,
      page,
      totalPages: Math.ceil(count as number / limit),
      unreadCount,
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[admin/feedback GET]', error)
    throw createError({ statusCode: 500, message: 'Terjadi kesalahan. Silakan coba lagi.' })
  }
})
