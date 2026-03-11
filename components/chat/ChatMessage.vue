<template>
  <div :class="['flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row']">
    <!-- Avatar -->
    <div
      :class="[
        'w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold mt-1',
        isUser
          ? 'bg-primary-500 text-white'
          : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white',
      ]"
    >
      <UIcon v-if="!isUser" name="i-heroicons-sparkles" class="w-4 h-4" />
      <span v-else>{{ userInitial }}</span>
    </div>

    <!-- Content -->
    <div :class="['flex flex-col gap-1 max-w-[78%]', isUser ? 'items-end' : 'items-start']">
      <div
        :class="[
          'rounded-2xl px-4 py-3',
          isUser
            ? 'bg-primary-500 text-white rounded-tr-sm'
            : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-sm shadow-sm',
        ]"
      >
        <div v-if="isUser" class="text-sm leading-relaxed whitespace-pre-wrap">{{ message.content }}</div>
        <MarkdownRenderer v-else :content="message.content" />
      </div>

      <!-- Sources: collapsible footnotes -->
      <div v-if="!isUser && message.sources?.length" class="px-1">
        <button
          class="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500 transition-colors"
          @click="sourcesOpen = !sourcesOpen"
        >
          <UIcon :name="sourcesOpen ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" class="w-3 h-3" />
          {{ message.sources.length }} sumber referensi
        </button>
        <div v-if="sourcesOpen" class="mt-1.5 flex flex-col gap-1 pl-1">
          <span
            v-for="(src, i) in message.sources"
            :key="src.chunkId"
            class="text-xs text-gray-400 flex items-start gap-1.5"
          >
            <span class="text-gray-300 dark:text-gray-600 shrink-0 font-mono">[{{ i + 1 }}]</span>
            <span>{{ src.documentTitle }}, Halaman {{ src.pageNumber }}</span>
          </span>
        </div>
      </div>

      <!-- Timestamp -->
      <span class="text-[10px] text-gray-300 dark:text-gray-600 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {{ formatTime(message.createdAt) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage as ChatMessageType } from '~/types'

const props = defineProps<{ message: ChatMessageType }>()
const { user } = useAuth()

const isUser = computed(() => props.message.role === 'user')
const sourcesOpen = ref(false)
const userInitial = computed(() => user.value?.name?.charAt(0).toUpperCase() ?? 'U')

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
</script>
