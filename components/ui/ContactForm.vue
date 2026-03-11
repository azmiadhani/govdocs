<template>
  <div>
    <div v-if="success" class="text-center py-10">
      <div class="w-14 h-14 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pesan Terkirim!</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Terima kasih telah menghubungi kami. Kami akan merespons dalam 1-3 hari kerja.</p>
      <UButton variant="ghost" size="sm" @click="reset">Kirim Pesan Lagi</UButton>
    </div>

    <form v-else class="space-y-4" @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormGroup label="Nama Lengkap" required>
          <UInput v-model="form.name" placeholder="Nama Anda" />
        </UFormGroup>
        <UFormGroup label="Email" required>
          <UInput v-model="form.email" type="email" placeholder="email@contoh.com" />
        </UFormGroup>
      </div>
      <UFormGroup label="Subjek" required>
        <UInput v-model="form.subject" placeholder="Topik pesan Anda" />
      </UFormGroup>
      <UFormGroup label="Pesan" required>
        <UTextarea v-model="form.message" placeholder="Tuliskan pesan Anda di sini..." :rows="5" />
      </UFormGroup>

      <UAlert v-if="error" color="red" :description="error" />

      <UButton type="submit" :loading="loading" icon="i-heroicons-paper-airplane" block>
        Kirim Pesan
      </UButton>
    </form>
  </div>
</template>

<script setup lang="ts">
const form = reactive({ name: '', email: '', subject: '', message: '' })
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function onSubmit() {
  if (!form.name || !form.email || !form.subject || !form.message) {
    error.value = 'Semua kolom wajib diisi'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/public/contact', { method: 'POST', body: form })
    success.value = true
  } catch (err: any) {
    error.value = err.data?.message || 'Gagal mengirim pesan. Coba lagi.'
  } finally {
    loading.value = false
  }
}

function reset() {
  form.name = ''
  form.email = ''
  form.subject = ''
  form.message = ''
  success.value = false
  error.value = ''
}
</script>
