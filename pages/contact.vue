<template>
  <div>
    <!-- Header -->
    <section class="bg-gradient-to-br from-green-700 to-teal-600 text-white py-14">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-5">
          <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
          Kontak
        </div>
        <h1 class="text-3xl font-bold mb-3">Hubungi Kami</h1>
        <p class="text-green-100">Ada pertanyaan, masukan, atau laporan? Kami siap membantu.</p>
      </div>
    </section>

    <section class="py-16 bg-white dark:bg-gray-900">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <!-- Info -->
          <div class="space-y-6">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi Kontak</h2>
              <div class="space-y-4">
                <div v-for="info in contactInfo" :key="info.label" class="flex items-start gap-3">
                  <div class="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center shrink-0">
                    <UIcon :name="info.icon" class="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{{ info.label }}</p>
                    <p class="text-sm text-gray-900 dark:text-white mt-0.5">{{ info.value }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Jam Respons</h3>
              <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div class="flex justify-between">
                  <span>Senin – Jumat</span>
                  <span class="font-medium">1–2 hari kerja</span>
                </div>
                <div class="flex justify-between">
                  <span>Sabtu – Minggu</span>
                  <span class="font-medium">3–5 hari kerja</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Form -->
          <div class="lg:col-span-2">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Kirim Pesan</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

const contactInfo = [
  { label: 'Email', icon: 'i-heroicons-envelope', value: 'govdocs@ruangalgo.com' },
  { label: 'Platform', icon: 'i-heroicons-globe-alt', value: 'govdocs.ruangalgo.com' },
  { label: 'Lokasi', icon: 'i-heroicons-map-pin', value: 'Indonesia' },
]

useHead({ title: 'Kontak' })
</script>
