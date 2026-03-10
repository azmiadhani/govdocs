import { verifyToken } from '~/server/utils/auth'

// Server middleware: attach user to event context for all /api routes
// Individual routes still call requireAuth() — this is supplemental
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  if (!url.pathname.startsWith('/api')) return

  const token = getCookie(event, 'auth_token')
  if (token) {
    try {
      const user = await verifyToken(token)
      event.context.user = user
    } catch {
      // Invalid token — context.user stays undefined
    }
  }
})
