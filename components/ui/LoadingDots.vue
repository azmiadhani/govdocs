<template>
  <div class="flex items-center gap-1">
    <span
      v-for="i in 3"
      :key="i"
      class="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
      :style="{ animationDelay: `${(i - 1) * 0.15}s` }"
    />
  </div>
</template>
