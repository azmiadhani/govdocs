import { User, getSequelize } from '~/server/models'
import { signToken, comparePassword, setAuthCookie } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email and password are required' })
  }

  // Ensure DB connection
  getSequelize()

  const user = await User.findOne({ where: { email: email.toLowerCase().trim() } })

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw createError({ statusCode: 401, message: 'Invalid email or password' })
  }

  const token = await signToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  setAuthCookie(event, token)

  return { user: user.toSafeObject() }
})
