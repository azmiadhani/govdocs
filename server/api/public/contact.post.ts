import { Feedback } from '~/server/models'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { name, email, subject, message } = body

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    throw createError({ statusCode: 400, message: 'Semua kolom wajib diisi' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw createError({ statusCode: 400, message: 'Format email tidak valid' })
  }

  await Feedback.create({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() })

  return { success: true, message: 'Pesan Anda telah dikirim. Terima kasih!' }
})
