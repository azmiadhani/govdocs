<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          GovDocs <span class="text-primary-500">AI</span>
        </h1>
        <p class="text-sm text-gray-500 mt-1">Masuk ke akun Anda</p>
      </div>

      <UCard>
        <UForm :state="form" :validate="validate" class="space-y-4" @submit="onSubmit">
          <UFormGroup label="Email" name="email" required>
            <UInput
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
            />
          </UFormGroup>

          <UFormGroup label="Kata Sandi" name="password" required>
            <UInput
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </UFormGroup>

          <UAlert v-if="error" color="red" :description="error" />

          <UButton type="submit" block :loading="loading">Masuk</UButton>
        </UForm>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { login } = useAuth()
const route = useRoute()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

function validate(state: typeof form) {
  const errors = []
  if (!state.email) errors.push({ path: 'email', message: 'Wajib diisi' })
  if (!state.password) errors.push({ path: 'password', message: 'Wajib diisi' })
  return errors
}

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    await login(form.email, form.password)
    const redirect = (route.query.redirect as string) || '/'
    await navigateTo(redirect)
  } catch (err: any) {
    error.value = err.data?.message || 'Email atau kata sandi tidak valid'
  } finally {
    loading.value = false
  }
}
</script>
