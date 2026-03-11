<template>
  <div>
    <!-- Header -->
    <section class="bg-gradient-to-br from-gray-800 to-gray-700 text-white py-14">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-5">
          <UIcon name="i-heroicons-clock" class="w-4 h-4" />
          Riwayat Perubahan
        </div>
        <h1 class="text-3xl font-bold mb-3">Changelog</h1>
        <p class="text-gray-300">Pembaruan dan peningkatan terbaru pada platform GovDocs AI</p>
      </div>
    </section>

    <section class="py-16 bg-white dark:bg-gray-900">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Loading -->
        <div v-if="pending" class="space-y-8">
          <div v-for="i in 3" :key="i" class="pl-8">
            <USkeleton class="h-4 w-32 mb-3 rounded" />
            <USkeleton class="h-6 w-3/4 mb-2 rounded" />
            <USkeleton class="h-20 w-full rounded" />
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="!entries.length" class="text-center py-16 text-gray-400">
          <UIcon name="i-heroicons-clock" class="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p class="text-sm">Belum ada entri changelog.</p>
        </div>

        <!-- Timeline -->
        <div v-else class="relative">
          <div class="absolute left-[7px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
          <ChangelogEntry
            v-for="(entry, i) in entries"
            :key="entry.id"
            :entry="entry"
            :is-last="i === entries.length - 1"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

const { data, pending } = await useAsyncData('changelog', () => $fetch<any[]>('/api/public/changelog'))
const entries = computed(() => data.value || [])

useHead({ title: 'Changelog | GovDocs AI' })
</script>
