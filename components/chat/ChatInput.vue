<template>
  <div class="flex items-end gap-2 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
    <UTextarea
      v-model="input"
      :rows="1"
      autoresize
      :max-rows="5"
      placeholder="Ask about the documents..."
      class="flex-1"
      :disabled="disabled"
      @keydown.enter.exact.prevent="submit"
    />
    <UButton
      icon="i-heroicons-paper-airplane"
      :disabled="!input.trim() || disabled"
      :loading="loading"
      @click="submit"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'send', message: string): void
}>()

const input = ref('')

function submit() {
  const msg = input.value.trim()
  if (!msg || props.disabled) return
  emit('send', msg)
  input.value = ''
}
</script>
