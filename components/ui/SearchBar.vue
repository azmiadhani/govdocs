<template>
  <form class="flex gap-2" @submit.prevent="onSubmit">
    <UInput
      v-model="query"
      :placeholder="placeholder"
      size="lg"
      icon="i-heroicons-magnifying-glass"
      class="flex-1"
      :autofocus="autofocus"
    />
    <UButton type="submit" size="lg" :label="buttonLabel" icon="i-heroicons-magnifying-glass" />
  </form>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  placeholder?: string
  buttonLabel?: string
  autofocus?: boolean
  modelValue?: string
}>(), {
  placeholder: 'Cari dokumen...',
  buttonLabel: 'Cari Dokumen',
  autofocus: false,
  modelValue: '',
})

const emit = defineEmits<{
  (e: 'search', query: string): void
  (e: 'update:modelValue', value: string): void
}>()

const query = ref(props.modelValue)

watch(() => props.modelValue, (v) => { query.value = v })
watch(query, (v) => emit('update:modelValue', v))

function onSubmit() {
  emit('search', query.value.trim())
}
</script>
