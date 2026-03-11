import type { ChatMessage, ChatSession } from '~/types'

export function useChat() {
  const messages = useState<ChatMessage[]>('chat.messages', () => [])
  const sessions = useState<ChatSession[]>('chat.sessions', () => [])
  const currentSession = useState<ChatSession | null>('chat.currentSession', () => null)
  const isStreaming = useState<boolean>('chat.isStreaming', () => false)
  const streamingText = useState<string>('chat.streamingText', () => '')
  const error = useState<string | null>('chat.error', () => null)

  async function createSession(scope: 'global' | 'document', documentId?: string): Promise<ChatSession> {
    const title = 'Chat Baru'
    const data = await $fetch<{ session: ChatSession }>('/api/chat/sessions', {
      method: 'POST',
      body: { scope, documentId: documentId ?? null, title },
    })
    currentSession.value = data.session
    sessions.value.unshift(data.session)
    messages.value = []
    return data.session
  }

  async function loadHistory(sessionId: string): Promise<void> {
    const data = await $fetch<{ messages: ChatMessage[] }>(
      `/api/chat/sessions/${sessionId}/messages`
    )
    messages.value = data.messages
  }

  async function fetchSessions(): Promise<void> {
    const data = await $fetch<{ sessions: ChatSession[] }>('/api/chat/sessions')
    sessions.value = data.sessions
  }

  async function updateSessionTitle(sessionId: string, title: string): Promise<void> {
    try {
      await $fetch(`/api/chat/sessions/${sessionId}`, { method: 'PATCH', body: { title } })
      if (currentSession.value?.id === sessionId) currentSession.value.title = title
      const s = sessions.value.find((s) => s.id === sessionId)
      if (s) s.title = title
    } catch {}
  }

  async function sendMessage(query: string, documentIds?: string[]): Promise<void> {
    if (!currentSession.value) throw new Error('No active chat session')
    if (!query.trim() || isStreaming.value) return

    error.value = null
    const isFirstMessage = messages.value.length === 0
    const sessionId = currentSession.value.id

    // Optimistic user message
    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId,
      role: 'user',
      content: query,
      sources: [],
      createdAt: new Date().toISOString(),
    }
    messages.value.push(userMsg)

    isStreaming.value = true
    streamingText.value = ''

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          sessionId,
          documentIds: documentIds ?? null,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) streamingText.value += parsed.text
            } catch {}
          }
        }
      }

      // Commit streamed message
      if (streamingText.value) {
        messages.value.push({
          id: `assistant-${Date.now()}`,
          sessionId,
          role: 'assistant',
          content: streamingText.value,
          sources: [],
          createdAt: new Date().toISOString(),
        })
      }

      // Auto-title session from first user message
      if (isFirstMessage) {
        const title = query.length > 60 ? query.slice(0, 60).trimEnd() + '…' : query
        await updateSessionTitle(sessionId, title)
      }
    } catch (err: any) {
      error.value = err.message || 'Chat gagal'
    } finally {
      isStreaming.value = false
      streamingText.value = ''
    }
  }

  return {
    messages,
    sessions,
    currentSession,
    isStreaming,
    streamingText,
    error,
    createSession,
    loadHistory,
    fetchSessions,
    sendMessage,
  }
}
