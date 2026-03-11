<template>
  <div class="flex h-full overflow-hidden">
    <!-- Left sidebar: session history -->
    <div class="w-64 shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div class="p-3 border-b border-gray-200 dark:border-gray-800">
        <UButton block icon="i-heroicons-plus" variant="soft" @click="startNewSession">
          Chat Baru
        </UButton>
      </div>

      <div class="flex-1 overflow-y-auto py-2">
        <div v-if="sessions.length === 0" class="px-3 py-6 text-center text-xs text-gray-400">
          Belum ada riwayat chat
        </div>
        <button v-for="s in sessions" :key="s.id" :class="[
          'w-full text-left px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
          currentSession?.id === s.id ? 'bg-primary-50 dark:bg-primary-900/20 border-l-2 border-primary-500' : '',
        ]" @click="selectSession(s)">
          <p class="text-sm font-medium truncate text-gray-800 dark:text-gray-200">{{ s.title }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(s.updatedAt) }}</p>
        </button>
      </div>
    </div>

    <!-- Main chat area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <div v-if="currentSession" class="flex-1 overflow-hidden">
        <ChatWindow :session-id="currentSession.id" :document-ids="scopedDocIds.length ? scopedDocIds : undefined" />
      </div>

      <div v-else class="flex-1 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <UIcon name="i-heroicons-chat-bubble-left-right" class="w-14 h-14 mx-auto mb-4 opacity-30" />
          <p class="text-sm mb-4">Mulai sesi chat baru atau pilih riwayat chat</p>
          <UButton icon="i-heroicons-plus" @click="startNewSession">Mulai Chat</UButton>
        </div>
      </div>
    </div>

    <!-- Right panel: document scope (collapsible) -->
    <div :class="[
      'shrink-0 flex flex-col border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 transition-all duration-200 overflow-hidden',
      scopePanelOpen ? 'w-72' : 'w-10',
    ]">
      <!-- Toggle button -->
      <button
        class="flex items-center justify-center h-10 w-10 shrink-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        :title="scopePanelOpen ? 'Tutup panel dokumen' : 'Pilih cakupan dokumen'"
        @click="scopePanelOpen = !scopePanelOpen">
        <UIcon :name="scopePanelOpen ? 'i-heroicons-chevron-right' : 'i-heroicons-funnel'"
          class="w-4 h-4 text-gray-500" />
      </button>

      <div v-if="scopePanelOpen" class="flex-1 overflow-y-auto p-3">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Cakupan Dokumen</p>

        <!-- All docs option -->
        <label class="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer mb-1">
          <input type="checkbox" :checked="scopedDocIds.length === 0" class="rounded" @change="scopedDocIds = []" />
          <span class="text-sm text-gray-700 dark:text-gray-300 font-medium">Semua Dokumen</span>
        </label>

        <div class="border-t border-gray-200 dark:border-gray-700 my-2" />

        <label v-for="doc in allDocuments" :key="doc.id"
          class="flex items-start gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer mb-0.5">
          <input type="checkbox" :checked="scopedDocIds.includes(doc.id)" class="rounded mt-0.5"
            @change="toggleDoc(doc.id)" />
          <span class="text-sm text-gray-700 dark:text-gray-300 leading-tight">{{ doc.title }}</span>
        </label>

        <p v-if="allDocuments.length === 0" class="text-xs text-gray-400 text-center py-4">
          Belum ada dokumen terindeks
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatSession } from '~/types'

definePageMeta({ middleware: 'auth', layout: 'chat' })

const { fetchDocuments, documents: allDocuments } = useDocuments()
const { sessions, currentSession, createSession, loadHistory, fetchSessions } = useChat()
const scopedDocIds = ref<string[]>([])
const scopePanelOpen = ref(true)

onMounted(async () => {
  await Promise.all([
    fetchDocuments({ status: 'indexed', limit: 100 }),
    fetchSessions(),
  ])
})

async function startNewSession() {
  await createSession('global')
}

async function selectSession(session: ChatSession) {
  currentSession.value = session
  await loadHistory(session.id)
}

function toggleDoc(id: string) {
  const idx = scopedDocIds.value.indexOf(id)
  if (idx >= 0) scopedDocIds.value.splice(idx, 1)
  else scopedDocIds.value.push(id)
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Kemarin'
  if (diffDays < 7) return `${diffDays} hari lalu`
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}
</script>
