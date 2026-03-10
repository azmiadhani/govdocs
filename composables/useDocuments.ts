import type { Document, DocumentListParams, DocumentListResponse } from '~/types'

export function useDocuments() {
  const documents = ref<Document[]>([])
  const total = ref(0)
  const totalPages = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDocuments(params: DocumentListParams = {}): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<DocumentListResponse>('/api/documents', { query: params })
      documents.value = data.data
      total.value = data.total
      totalPages.value = data.totalPages
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to load documents'
    } finally {
      loading.value = false
    }
  }

  async function fetchDocument(id: string): Promise<Document> {
    const data = await $fetch<{ document: Document }>(`/api/documents/${id}`)
    return data.document
  }

  async function deleteDocument(id: string): Promise<void> {
    await $fetch(`/api/documents/${id}`, { method: 'DELETE' })
    documents.value = documents.value.filter((d) => d.id !== id)
  }

  async function updateDocument(id: string, body: Partial<Document>): Promise<Document> {
    const data = await $fetch<{ document: Document }>(`/api/documents/${id}`, {
      method: 'PUT',
      body,
    })
    const idx = documents.value.findIndex((d) => d.id === id)
    if (idx >= 0) documents.value[idx] = data.document
    return data.document
  }

  async function uploadDocument(formData: FormData): Promise<Document> {
    const data = await $fetch<{ document: Document }>('/api/documents', {
      method: 'POST',
      body: formData,
    })
    return data.document
  }

  return {
    documents,
    total,
    totalPages,
    loading,
    error,
    fetchDocuments,
    fetchDocument,
    deleteDocument,
    updateDocument,
    uploadDocument,
  }
}
