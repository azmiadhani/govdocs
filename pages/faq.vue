<template>
  <div>
    <!-- Header -->
    <section class="bg-gradient-to-br from-indigo-700 to-primary-600 text-white py-14">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-5">
          <UIcon name="i-heroicons-question-mark-circle" class="w-4 h-4" />
          FAQ
        </div>
        <h1 class="text-3xl font-bold mb-3">Pertanyaan yang Sering Diajukan</h1>
        <p class="text-indigo-100">Temukan jawaban atas pertanyaan umum tentang GovDocs AI</p>
      </div>
    </section>

    <!-- FAQ sections -->
    <section class="py-16 bg-white dark:bg-gray-900">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div v-for="section in faqSections" :key="section.title" class="mb-12">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UIcon :name="section.icon" class="w-5 h-5 text-primary-500" />
            {{ section.title }}
          </h2>
          <FaqAccordion :items="section.items" />
        </div>

        <!-- Still have questions -->
        <div class="mt-12 p-6 rounded-xl bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 text-center">
          <UIcon name="i-heroicons-chat-bubble-left-right" class="w-8 h-8 text-primary-500 mx-auto mb-3" />
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Masih ada pertanyaan?</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Hubungi tim kami dan kami akan segera merespons.</p>
          <NuxtLink to="/contact">
            <UButton size="sm" icon="i-heroicons-envelope">Hubungi Kami</UButton>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

const faqSections = [
  {
    title: 'Tentang Platform',
    icon: 'i-heroicons-information-circle',
    items: [
      {
        question: 'Apa itu GovDocs AI?',
        answer: 'GovDocs AI adalah platform berbasis kecerdasan buatan untuk mengakses, mencari, dan memahami dokumen kebijakan pemerintah Indonesia. Platform ini menyediakan pencarian semantik, ringkasan otomatis, dan fitur tanya jawab berbasis dokumen.',
      },
      {
        question: 'Apakah GovDocs AI gratis?',
        answer: 'Ya, akses ke dokumen publik, pencarian, dan melihat ringkasan AI sepenuhnya gratis. Fitur Chat AI memerlukan akun untuk dapat digunakan.',
      },
      {
        question: 'Dari mana sumber dokumen di GovDocs AI?',
        answer: 'Dokumen diperoleh dari sumber resmi kementerian dan lembaga pemerintah Indonesia, termasuk undang-undang, peraturan pemerintah, keputusan menteri, surat edaran, dan pedoman teknis.',
      },
    ],
  },
  {
    title: 'Pencarian & Dokumen',
    icon: 'i-heroicons-magnifying-glass',
    items: [
      {
        question: 'Bagaimana cara mencari dokumen?',
        answer: 'Gunakan kotak pencarian di halaman utama atau halaman Dokumen. Anda dapat mencari berdasarkan kata kunci, judul, jenis dokumen, atau nama kementerian. Pencarian kami menggunakan AI untuk memahami konteks, bukan sekadar pencocokan kata kunci.',
      },
      {
        question: 'Apakah saya bisa memfilter dokumen?',
        answer: 'Ya, Anda dapat memfilter berdasarkan jenis dokumen (undang-undang, peraturan, keputusan, dll), kementerian penerbit, dan urutan tampilan (terbaru atau relevan).',
      },
      {
        question: 'Apakah saya bisa mengunduh dokumen?',
        answer: 'Ya, setiap dokumen tersedia untuk diunduh dalam format PDF. Klik tombol "Unduh PDF" di halaman detail dokumen.',
      },
    ],
  },
  {
    title: 'Fitur AI & Chat',
    icon: 'i-heroicons-sparkles',
    items: [
      {
        question: 'Apa itu fitur Ringkasan AI?',
        answer: 'Ringkasan AI secara otomatis menganalisis isi dokumen dan menghasilkan ringkasan singkat beserta poin-poin kunci. Ini membantu Anda memahami isi dokumen secara cepat tanpa harus membaca keseluruhan teks.',
      },
      {
        question: 'Bagaimana cara menggunakan fitur Chat AI?',
        answer: 'Login ke akun Anda, buka halaman Chat AI, lalu ketikkan pertanyaan Anda. Anda bisa chat secara umum atau memilih dokumen tertentu untuk ditanyakan. AI akan menjawab berdasarkan konten dokumen yang relevan.',
      },
      {
        question: 'Seberapa akurat jawaban Chat AI?',
        answer: 'Chat AI menggunakan teknologi RAG (Retrieval Augmented Generation) yang menjawab berdasarkan konten dokumen asli. Namun, selalu verifikasi informasi penting langsung dari dokumen sumber yang tertera dalam referensi jawaban.',
      },
    ],
  },
  {
    title: 'Akun & Privasi',
    icon: 'i-heroicons-shield-check',
    items: [
      {
        question: 'Apakah saya perlu mendaftar untuk menggunakan platform ini?',
        answer: 'Tidak, Anda dapat menjelajahi dokumen, membaca ringkasan, dan melakukan pencarian tanpa akun. Akun diperlukan hanya untuk menggunakan fitur Chat AI.',
      },
      {
        question: 'Bagaimana data saya digunakan?',
        answer: 'Kami menyimpan riwayat pencarian dan sesi chat untuk meningkatkan layanan. Data Anda tidak dibagikan kepada pihak ketiga. Lihat kebijakan privasi kami untuk informasi lebih lengkap.',
      },
    ],
  },
]

useHead({ title: 'FAQ' })
</script>
