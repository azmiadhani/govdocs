import { requireRole } from '~/server/utils/auth'
import { Feedback } from '~/server/models'

const VALID_STATUSES = ['read', 'replied'] as const

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')

  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { status } = body

    if (!VALID_STATUSES.includes(status)) {
      throw createError({ statusCode: 400, message: 'Status tidak valid. Gunakan: read atau replied' })
    }

    const feedback = await Feedback.findByPk(id)
    if (!feedback) throw createError({ statusCode: 404, message: 'Feedback tidak ditemukan' })

    await feedback.update({ status })
    return feedback.toJSON()
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[admin/feedback PATCH]', error)
    throw createError({ statusCode: 500, message: 'Terjadi kesalahan. Silakan coba lagi.' })
  }
})
