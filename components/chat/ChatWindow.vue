<template>
  <div class="flex flex-col h-full">
    <ChatHistory
      :messages="messages"
      :streaming="isStreaming"
      :streaming-text="streamingText"
    />
    <ChatInput
      :loading="isStreaming"
      @send="onSend"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  sessionId: string
  documentIds?: string[]
}>()

const { messages, isStreaming, streamingText, error, sendMessage, loadHistory } = useChat()

onMounted(() => {
  if (props.sessionId) loadHistory(props.sessionId)
})

async function onSend(query: string) {
  await sendMessage(query, props.documentIds)
}
</script>
