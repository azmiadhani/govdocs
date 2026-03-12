import type { SmartSearchResult } from '~/types'

export function useSmartSearch() {
  const loading = ref(false)
  const result = ref<SmartSearchResult | null>(null)
  const error = ref<string | null>(null)
  const lastQuery = ref('')

  async function search(query: string) {
    const q = query.trim()
    if (!q) return

    loading.value = true
    error.value = null
    result.value = null
    lastQuery.value = q

    try {
      const data = await $fetch<SmartSearchResult>('/api/ai/smart-search', {
        method: 'POST',
        body: { query: q },
      })
      result.value = data
    } catch (e: any) {
      error.value = e?.data?.message || 'Terjadi kesalahan saat mencari. Coba lagi.'
    } finally {
      loading.value = false
    }
  }

  function clear() {
    result.value = null
    error.value = null
    lastQuery.value = ''
  }

  return { loading, result, error, lastQuery, search, clear }
}
