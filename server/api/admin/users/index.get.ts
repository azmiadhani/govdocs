import { requireRole } from '~/server/utils/auth'
import { User } from '~/server/models'

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')

  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['passwordHash'] },
    })

    return users.map(u => u.toJSON())
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[admin/users GET]', error)
    throw createError({ statusCode: 500, message: 'Terjadi kesalahan. Silakan coba lagi.' })
  }
})
