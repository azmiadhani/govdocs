<template>
  <div class="flex flex-col h-[calc(100vh-64px)]">
    <!-- Header -->
    <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <NuxtLink :to="`/documents/${documentId}`">
        <UButton icon="i-heroicons-arrow-left" variant="ghost" size="sm" />
      </NuxtLink>
      <div>
        <p class="text-xs text-gray-400 uppercase tracking-wide">Chat Dokumen</p>
        <p class="font-semibold text-sm truncate max-w-md">{{ doc?.title ?? documentId }}</p>
      </div>
    </div>

    <div v-if="currentSession" class="flex-1 overflow-hidden">
      <ChatWindow
        :session-id="currentSession.id"
        :document-ids="[documentId]"
      />
    </div>

    <div v-else class="flex-1 flex items-center justify-center">
      <LoadingDots />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Document } from '~/types'

definePageMeta({ middleware: 'auth', layout: 'chat' })

const route = useRoute()
const documentId = route.params.documentId as string

const { fetchDocument } = useDocuments()
const { currentSession, createSession } = useChat()
const doc = ref<Document | null>(null)

onMounted(async () => {
  try {
    doc.value = await fetchDocument(documentId)
  } catch {}
  await createSession('document', documentId)
})

useHead(() => ({
  title: doc.value ? `Chat: ${doc.value.title} | GovDocs AI` : 'GovDocs AI',
}))
</script>
