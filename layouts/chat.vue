<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
    <AppSidebar />
    <div class="flex-1 overflow-hidden flex flex-col">
      <slot />
    </div>
  </div>
</template>
