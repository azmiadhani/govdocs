<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-primary-700 to-indigo-700 text-white py-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
          Tentang Kami
        </div>
        <h1 class="text-4xl font-bold mb-4">GovDocs <span class="text-yellow-300">AI</span></h1>
        <p class="text-lg text-primary-100 max-w-2xl mx-auto">
          Platform cerdas untuk mengakses, mencari, dan memahami dokumen kebijakan pemerintah Indonesia dengan kecerdasan buatan.
        </p>
      </div>
    </section>

    <!-- Misi & Visi -->
    <section class="py-16 bg-white dark:bg-gray-900">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Misi Kami</h2>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              GovDocs AI hadir untuk menjembatani kesenjangan antara masyarakat dan dokumen kebijakan pemerintah. Kami percaya bahwa setiap warga negara berhak mendapatkan akses mudah terhadap regulasi dan kebijakan yang memengaruhi kehidupan mereka.
            </p>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              Dengan memanfaatkan kecerdasan buatan, kami menghadirkan kemampuan pencarian semantik, ringkasan otomatis, dan tanya jawab berbasis dokumen yang memudahkan pemahaman terhadap peraturan perundang-undangan Indonesia.
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="val in values" :key="val.title" class="p-5 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center mb-3">
                <UIcon :name="val.icon" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white text-sm mb-1">{{ val.title }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{{ val.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Fitur Utama -->
    <section class="py-16 bg-gray-50 dark:bg-gray-950">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Fitur Utama</h2>
          <p class="text-gray-500 dark:text-gray-400">Teknologi canggih untuk kemudahan akses dokumen</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="feat in features" :key="feat.title" class="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" :class="feat.bg">
              <UIcon :name="feat.icon" class="w-6 h-6" :class="feat.iconColor" />
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">{{ feat.title }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Teknologi -->
    <section class="py-16 bg-white dark:bg-gray-900">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Teknologi yang Kami Gunakan</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-10">Dibangun di atas infrastruktur modern dan terpercaya</p>
        <div class="flex flex-wrap justify-center gap-3">
          <UBadge v-for="tech in techs" :key="tech" size="lg" variant="soft" color="gray">{{ tech }}</UBadge>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 bg-primary-600 text-white">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <h2 class="text-2xl font-bold mb-3">Mulai Gunakan GovDocs AI</h2>
        <p class="text-primary-100 mb-8">Akses ribuan dokumen pemerintah secara gratis, tanpa perlu daftar.</p>
        <div class="flex flex-wrap justify-center gap-3">
          <NuxtLink to="/documents">
            <UButton size="lg" color="white" variant="solid">Jelajahi Dokumen</UButton>
          </NuxtLink>
          <NuxtLink to="/contact">
            <UButton size="lg" variant="outline" color="white">Hubungi Kami</UButton>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

const values = [
  { title: 'Transparansi', icon: 'i-heroicons-eye', desc: 'Membuka akses informasi publik yang selama ini sulit dijangkau.' },
  { title: 'Akurasi', icon: 'i-heroicons-check-badge', desc: 'Sumber dokumen resmi dari kementerian dan lembaga pemerintah.' },
  { title: 'Inovasi', icon: 'i-heroicons-sparkles', desc: 'Memanfaatkan AI terkini untuk pengalaman yang lebih cerdas.' },
  { title: 'Inklusif', icon: 'i-heroicons-users', desc: 'Dapat diakses oleh semua kalangan masyarakat Indonesia.' },
]

const features = [
  {
    title: 'Pencarian Semantik',
    icon: 'i-heroicons-magnifying-glass',
    bg: 'bg-blue-50 dark:bg-blue-950',
    iconColor: 'text-blue-600 dark:text-blue-400',
    desc: 'Cari dokumen berdasarkan makna dan konteks, bukan sekadar kata kunci yang persis sama.',
  },
  {
    title: 'Ringkasan AI',
    icon: 'i-heroicons-sparkles',
    bg: 'bg-purple-50 dark:bg-purple-950',
    iconColor: 'text-purple-600 dark:text-purple-400',
    desc: 'Setiap dokumen dilengkapi ringkasan otomatis dan poin-poin kunci yang dihasilkan AI.',
  },
  {
    title: 'Tanya Jawab Dokumen',
    icon: 'i-heroicons-chat-bubble-left-right',
    bg: 'bg-green-50 dark:bg-green-950',
    iconColor: 'text-green-600 dark:text-green-400',
    desc: 'Ajukan pertanyaan spesifik tentang dokumen dan dapatkan jawaban berbasis konten asli.',
  },
  {
    title: 'Preview PDF',
    icon: 'i-heroicons-document',
    bg: 'bg-orange-50 dark:bg-orange-950',
    iconColor: 'text-orange-600 dark:text-orange-400',
    desc: 'Baca dokumen langsung di browser tanpa perlu mengunduh file PDF.',
  },
  {
    title: 'Filter Lanjutan',
    icon: 'i-heroicons-funnel',
    bg: 'bg-indigo-50 dark:bg-indigo-950',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    desc: 'Filter berdasarkan jenis dokumen, kementerian penerbit, tanggal, dan kategori.',
  },
  {
    title: 'Chat Multi-Dokumen',
    icon: 'i-heroicons-document-duplicate',
    bg: 'bg-pink-50 dark:bg-pink-950',
    iconColor: 'text-pink-600 dark:text-pink-400',
    desc: 'Bandingkan dan tanyakan tentang beberapa dokumen sekaligus dalam satu sesi chat.',
  },
]

const techs = [
  'Nuxt 3', 'Vue 3', 'PostgreSQL', 'pgvector', 'OpenAI GPT-4o',
  'OpenAI Embeddings', 'Sequelize', 'Nitro', 'Tailwind CSS', 'Nuxt UI',
]

useHead({ title: 'Tentang Kami | GovDocs AI' })
</script>
