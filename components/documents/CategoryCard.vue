<template>
  <NuxtLink
    :to="`/documents?type=${type}`"
    class="group flex flex-col items-center gap-3 p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all text-center"
  >
    <div
      class="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
      :class="bgClass"
    >
      <UIcon :name="icon" class="w-6 h-6" :class="iconClass" />
    </div>
    <div>
      <p class="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {{ label }}
      </p>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ count.toLocaleString('id-ID') }} dokumen</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  type: string
  label: string
  count: number
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo'
}>()

const bgClass = computed(() => ({
  blue: 'bg-blue-50 dark:bg-blue-950',
  green: 'bg-green-50 dark:bg-green-950',
  purple: 'bg-purple-50 dark:bg-purple-950',
  orange: 'bg-orange-50 dark:bg-orange-950',
  red: 'bg-red-50 dark:bg-red-950',
  indigo: 'bg-indigo-50 dark:bg-indigo-950',
}[props.color]))

const iconClass = computed(() => ({
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  purple: 'text-purple-600 dark:text-purple-400',
  orange: 'text-orange-600 dark:text-orange-400',
  red: 'text-red-600 dark:text-red-400',
  indigo: 'text-indigo-600 dark:text-indigo-400',
}[props.color]))
</script>
