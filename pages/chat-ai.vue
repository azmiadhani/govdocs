<template>
  <div>
    <!-- Header -->
    <section class="bg-gradient-to-br from-primary-700 via-purple-700 to-indigo-700 text-white py-14">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-5">
          <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
          Chat AI
        </div>
        <h1 class="text-3xl font-bold mb-3">Tanya Jawab Dokumen dengan AI</h1>
        <p class="text-primary-100 max-w-xl mx-auto">
          Ajukan pertanyaan tentang regulasi dan kebijakan pemerintah. AI kami akan menjawab berdasarkan dokumen resmi.
        </p>
      </div>
    </section>

    <!-- Redirect logged-in users -->
    <section v-if="isLoggedIn" class="py-20 bg-white dark:bg-gray-900">
      <div class="max-w-md mx-auto px-4 text-center">
        <div class="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Anda sudah login!</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-6">Gunakan fitur Chat AI penuh dengan riwayat percakapan dan pemilihan dokumen.</p>
        <NuxtLink to="/chat">
          <UButton size="lg" icon="i-heroicons-chat-bubble-left-right">Buka Chat AI</UButton>
        </NuxtLink>
      </div>
    </section>

    <!-- Demo & explanation for guests -->
    <section v-else class="py-16 bg-white dark:bg-gray-900">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <!-- Demo preview (static) -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contoh Tanya Jawab</h2>
            <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-hidden">
              <!-- Chat header -->
              <div class="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div class="w-2 h-2 rounded-full bg-green-400" />
                <span class="text-xs font-medium text-gray-600 dark:text-gray-400">GovDocs AI Chat</span>
              </div>
              <!-- Messages -->
              <div class="p-4 space-y-4">
                <div v-for="msg in demoMessages" :key="msg.id" class="flex gap-3" :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
                  <div
                    class="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                    :class="msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'"
                  >
                    {{ msg.role === 'user' ? 'U' : 'AI' }}
                  </div>
                  <div
                    class="max-w-xs px-3 py-2 rounded-xl text-sm leading-relaxed"
                    :class="msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-tl-sm'"
                  >
                    {{ msg.content }}
                  </div>
                </div>
              </div>
              <!-- Locked input -->
              <div class="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm text-gray-400">
                  <UIcon name="i-heroicons-lock-closed" class="w-4 h-4 shrink-0" />
                  Login untuk mulai chat...
                </div>
              </div>
            </div>
          </div>

          <!-- Login prompt -->
          <div class="space-y-6">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Mulai dengan Login</h2>
              <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Fitur Chat AI tersedia gratis untuk pengguna terdaftar. Login untuk mendapatkan akses penuh termasuk riwayat percakapan dan pemilihan dokumen spesifik.
              </p>
            </div>

            <div class="space-y-3">
              <div v-for="benefit in benefits" :key="benefit" class="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <div class="w-5 h-5 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
                  <UIcon name="i-heroicons-check" class="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                {{ benefit }}
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <NuxtLink to="/login?redirect=/chat">
                <UButton size="lg" block icon="i-heroicons-arrow-right-on-rectangle">Masuk dan Mulai Chat</UButton>
              </NuxtLink>
              <NuxtLink to="/documents">
                <UButton size="lg" block variant="outline" icon="i-heroicons-document-text">
                  Jelajahi Dokumen Tanpa Login
                </UButton>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- How it works -->
        <div class="mt-16">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white text-center mb-10">Cara Kerja Chat AI</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div v-for="(step, i) in steps" :key="step.title" class="text-center">
              <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center mx-auto mb-3">
                <span class="text-lg font-bold text-primary-600 dark:text-primary-400">{{ i + 1 }}</span>
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{{ step.title }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

const { isLoggedIn } = useAuth()

const demoMessages = [
  { id: 1, role: 'user', content: 'Apa isi dari UU No. 11 Tahun 2020 tentang Cipta Kerja?' },
  { id: 2, role: 'assistant', content: 'UU Cipta Kerja (Omnibus Law) merupakan undang-undang yang mengintegrasikan dan menyederhanakan berbagai regulasi untuk kemudahan berusaha di Indonesia...' },
  { id: 3, role: 'user', content: 'Pasal berapa yang mengatur tentang ketenagakerjaan?' },
]

const benefits = [
  'Tanya jawab langsung tentang isi dokumen',
  'Riwayat percakapan tersimpan otomatis',
  'Pilih dokumen spesifik untuk dianalisis',
  'Referensi sumber ditampilkan transparan',
  'Chat global lintas semua dokumen',
]

const steps = [
  {
    title: 'Pilih Dokumen',
    desc: 'Pilih satu atau beberapa dokumen yang ingin Anda tanyakan, atau gunakan mode global untuk semua dokumen.',
  },
  {
    title: 'Ajukan Pertanyaan',
    desc: 'Ketikkan pertanyaan Anda dalam bahasa alami. AI akan memahami konteks dan makna pertanyaan Anda.',
  },
  {
    title: 'Dapatkan Jawaban',
    desc: 'AI memberikan jawaban berdasarkan konten dokumen asli, dilengkapi referensi halaman yang spesifik.',
  },
]

useHead({ title: 'Chat AI' })
</script>
