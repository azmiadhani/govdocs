import type { AuthUser } from '~/types'

const user = ref<AuthUser | null>(null)

export function useAuth() {
  async function fetchUser(): Promise<void> {
    try {
      const data = await $fetch<{ user: AuthUser }>('/api/auth/me')
      user.value = data.user
    } catch {
      user.value = null
    }
  }

  async function login(email: string, password: string): Promise<void> {
    const data = await $fetch<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = data.user
  }

  async function logout(): Promise<void> {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isEditor = computed(() => user.value?.role === 'admin' || user.value?.role === 'editor')
  const isLoggedIn = computed(() => !!user.value)

  return { user: readonly(user), fetchUser, login, logout, isAdmin, isEditor, isLoggedIn }
}
