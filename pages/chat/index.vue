<template>
  <div class="flex flex-col h-[calc(100vh-64px)]">
    <!-- Scope selector -->
    <DocumentScopeSelector
      :documents="allDocuments"
      @update:selected="scopedDocIds = $event"
    />

    <!-- Chat window or session required -->
    <div v-if="currentSession" class="flex-1 overflow-hidden">
      <ChatWindow
        :session-id="currentSession.id"
        :document-ids="scopedDocIds.length ? scopedDocIds : undefined"
      />
    </div>

    <div v-else class="flex-1 flex items-center justify-center text-gray-400">
      <div class="text-center">
        <UIcon name="i-heroicons-chat-bubble-left-right" class="w-12 h-12 mx-auto mb-3 opacity-40" />
        <UButton @click="startSession">Start Chatting</UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'chat' })

const { fetchDocuments, documents: allDocuments } = useDocuments()
const { currentSession, createSession } = useChat()
const scopedDocIds = ref<string[]>([])

onMounted(async () => {
  await fetchDocuments({ status: 'indexed', limit: 100 })
})

async function startSession() {
  await createSession('global')
}
</script>
