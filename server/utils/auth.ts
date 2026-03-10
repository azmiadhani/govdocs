import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import type { H3Event } from 'h3'
import type { AuthUser, JWTPayload, Role } from '~/types'

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function signToken(payload: AuthUser): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as unknown as JWTPayload
}

export async function requireAuth(event: H3Event): Promise<AuthUser> {
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  try {
    const payload = await verifyToken(token)
    return { id: payload.id, email: payload.email, name: payload.name, role: payload.role }
  } catch {
    throw createError({ statusCode: 401, message: 'Invalid or expired token' })
  }
}

export async function requireRole(event: H3Event, role: Role): Promise<AuthUser> {
  const user = await requireAuth(event)
  const hierarchy: Role[] = ['viewer', 'editor', 'admin']
  if (hierarchy.indexOf(user.role) < hierarchy.indexOf(role)) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }
  return user
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function setAuthCookie(event: H3Event, token: string): void {
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export function clearAuthCookie(event: H3Event): void {
  deleteCookie(event, 'auth_token', { path: '/' })
}
