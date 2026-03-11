<template>
  <div ref="cardRef" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex items-center gap-4">
    <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" :class="iconBg">
      <UIcon :name="icon" class="w-6 h-6" :class="iconColor" />
    </div>
    <div>
      <div class="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
        {{ displayValue.toLocaleString('id-ID') }}
      </div>
      <div class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  value: number
  label: string
  icon: string
  color?: string
}>()

const cardRef = ref<HTMLElement>()
const displayValue = ref(0)
let animated = false

const iconBg = computed(() => {
  const c = props.color || 'blue'
  const map: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-950/30',
    green: 'bg-green-50 dark:bg-green-950/30',
    purple: 'bg-purple-50 dark:bg-purple-950/30',
    orange: 'bg-orange-50 dark:bg-orange-950/30',
    pink: 'bg-pink-50 dark:bg-pink-950/30',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30',
  }
  return map[c] || map.blue
})

const iconColor = computed(() => {
  const c = props.color || 'blue'
  const map: Record<string, string> = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400',
    pink: 'text-pink-600 dark:text-pink-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
  }
  return map[c] || map.blue
})

function animate(target: number) {
  if (animated) return
  animated = true
  const duration = 1500
  const start = performance.now()
  function step(now: number) {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    displayValue.value = Math.round(eased * target)
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        animate(props.value)
        observer.disconnect()
      }
    },
    { threshold: 0.3 },
  )
  if (cardRef.value) observer.observe(cardRef.value)
})
</script>
