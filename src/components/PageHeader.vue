<script setup lang="ts">
defineProps<{title: string}>();
</script>

<template>
  <header class="flex min-h-11 items-center justify-between gap-3 pt-2">
    <h1 class="text-[28px] font-bold tracking-tight">{{ title }}</h1>
    <slot />
  </header>
</template>
