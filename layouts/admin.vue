<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
    <AppSidebar />
    <main class="flex-1 overflow-y-auto">
      <div class="max-w-6xl mx-auto px-6 py-8">
        <slot />
      </div>
    </main>
  </div>
</template>
