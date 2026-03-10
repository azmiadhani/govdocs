import type { AiSummary } from '~/types'

export function useAISummary(documentId: string) {
  const summary = ref<AiSummary | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSummary(): Promise<void> {
    if (summary.value) return
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<{ summary: AiSummary }>('/api/ai/summarize', {
        method: 'POST',
        body: { documentId },
      })
      summary.value = data.summary
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to generate summary'
    } finally {
      loading.value = false
    }
  }

  return { summary, loading, error, fetchSummary }
}
