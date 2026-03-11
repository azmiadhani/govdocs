// Runs on both server (SSR) and client hydration.
// On server: $fetch forwards the incoming request cookies automatically.
// On client: re-fetches only if useState is empty (e.g. hard refresh without SSR hydration).
export default defineNuxtPlugin(async () => {
  const { user, fetchUser } = useAuth()
  if (!user.value) {
    await fetchUser()
  }
})
