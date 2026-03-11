<template>
  <div class="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900" style="height: 500px;">
    <iframe
      v-if="!loadError"
      :src="src"
      class="w-full h-full"
      type="application/pdf"
      @load="loading = false"
      @error="onError"
    />
    <div v-if="loading && !loadError" class="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div class="text-center text-gray-400">
        <UIcon name="i-heroicons-document-text" class="w-10 h-10 mx-auto mb-2 animate-pulse" />
        <p class="text-sm">Memuat dokumen...</p>
      </div>
    </div>
    <div v-if="loadError" class="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div class="text-center text-gray-400 px-6">
        <UIcon name="i-heroicons-exclamation-circle" class="w-10 h-10 mx-auto mb-2" />
        <p class="text-sm font-medium mb-1">Browser tidak dapat menampilkan PDF</p>
        <p class="text-xs mb-4">Gunakan tombol di bawah untuk membuka atau mengunduh dokumen</p>
        <UButton :href="src" target="_blank" size="sm" variant="outline" icon="i-heroicons-arrow-top-right-on-square">
          Buka di Tab Baru
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ src: string }>()

const loading = ref(true)
const loadError = ref(false)

function onError() {
  loading.value = false
  loadError.value = true
}

watch(() => props.src, () => {
  loading.value = true
  loadError.value = false
})
</script>
