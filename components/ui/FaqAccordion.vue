<template>
  <div class="space-y-2">
    <div
      v-for="(item, i) in items"
      :key="i"
      class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
    >
      <button
        class="w-full flex items-center justify-between px-5 py-4 text-left bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        @click="toggle(i)"
      >
        <span class="font-medium text-gray-900 dark:text-white text-sm pr-4">{{ item.question }}</span>
        <UIcon
          name="i-heroicons-chevron-down"
          class="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200"
          :class="{ 'rotate-180': openIndex === i }"
        />
      </button>
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-96"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 max-h-96"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-if="openIndex === i" class="px-5 pb-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <p class="text-sm text-gray-600 dark:text-gray-400 pt-3 leading-relaxed">{{ item.answer }}</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: { question: string; answer: string }[]
}>()

const openIndex = ref<number | null>(0)

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}
</script>
