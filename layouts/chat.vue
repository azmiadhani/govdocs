<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
    <AppSidebar />
    <div class="flex-1 overflow-hidden flex flex-col min-h-0">
      <slot />
    </div>
  </div>
</template>
