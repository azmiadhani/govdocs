import { requireRole, requireAuth } from '~/server/utils/auth'
import { User } from '~/server/models'

const VALID_ROLES = ['admin', 'editor', 'viewer'] as const

export default defineEventHandler(async (event) => {
  const currentUser = await requireRole(event, 'admin')

  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { role } = body

    if (!VALID_ROLES.includes(role)) {
      throw createError({ statusCode: 400, message: 'Role tidak valid. Gunakan: admin, editor, atau viewer' })
    }

    if (currentUser.id === id) {
      throw createError({ statusCode: 400, message: 'Tidak dapat mengubah role sendiri' })
    }

    const user = await User.findByPk(id)
    if (!user) throw createError({ statusCode: 404, message: 'Pengguna tidak ditemukan' })

    await user.update({ role })

    const { passwordHash: _, ...safe } = user.toJSON() as any
    return safe
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[admin/users/role PATCH]', error)
    throw createError({ statusCode: 500, message: 'Terjadi kesalahan. Silakan coba lagi.' })
  }
})
