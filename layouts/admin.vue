<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <AppNav />
    <div class="flex max-w-7xl mx-auto">
      <AdminSidebar />
      <main class="flex-1 px-6 py-8 min-h-[calc(100vh-64px)] overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
