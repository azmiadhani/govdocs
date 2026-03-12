<template>
  <div class="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4">
    <div class="text-center max-w-md">
      <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
        <UIcon :name="icon" class="w-10 h-10 text-gray-400" />
      </div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ title }}</h1>
      <p class="text-sm text-gray-400 font-mono mb-2">{{ statusCode }}</p>
      <p class="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">{{ message }}</p>
      <div class="flex flex-wrap justify-center gap-3">
        <UButton icon="i-heroicons-home" @click="clearError({ redirect: '/' })">
          Kembali ke Beranda
        </UButton>
        <UButton variant="ghost" icon="i-heroicons-arrow-left" @click="clearError({ redirect: undefined })">
          Kembali
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; message?: string } }>()

const statusCode = computed(() => props.error?.statusCode ?? 500)
const is404 = computed(() => statusCode.value === 404)
const is403 = computed(() => statusCode.value === 403)

const title = computed(() => {
  if (is404.value) return 'Halaman Tidak Ditemukan'
  if (is403.value) return 'Akses Ditolak'
  return 'Terjadi Kesalahan'
})

const message = computed(() => {
  if (is404.value) return 'Halaman yang Anda cari tidak ada atau telah dipindahkan.'
  if (is403.value) return 'Anda tidak memiliki izin untuk mengakses halaman ini.'
  return 'Terjadi kesalahan tak terduga pada server. Silakan coba lagi beberapa saat.'
})

const icon = computed(() => {
  if (is404.value) return 'i-heroicons-map'
  if (is403.value) return 'i-heroicons-lock-closed'
  return 'i-heroicons-exclamation-triangle'
})
</script>
