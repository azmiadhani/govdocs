<template>
  <button
    type="button"
    :class="[
      'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-colors hover:opacity-80',
      colorClass,
    ]"
    @click="$emit('click')"
  >
    <UIcon v-if="icon" :name="icon" class="w-3.5 h-3.5" />
    {{ label }}
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  type: 'searched' | 'viewed' | 'default'
}>()

defineEmits<{ (e: 'click'): void }>()

const colorClass = computed(() => {
  if (props.type === 'searched') return 'border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'
  if (props.type === 'viewed') return 'border-green-300 text-green-700 dark:border-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30'
  return 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900'
})

const icon = computed(() => {
  if (props.type === 'searched') return 'i-heroicons-magnifying-glass'
  if (props.type === 'viewed') return 'i-heroicons-eye'
  return null
})
</script>
