<script setup lang="ts" generic="T extends string">
// 可橫向捲動的分類篩選；「全部」用 undefined 表示
defineProps<{options: Array<{value: T; label: string}>; label: string}>();
const model = defineModel<T | undefined>({required: true});
</script>

<template>
  <div class="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]" role="group" :aria-label="label">
    <div class="flex w-max gap-2">
      <button
        v-for="opt in [{value: undefined, label: '全部'}, ...options]"
        :key="opt.label"
        type="button"
        class="press h-9 rounded-full border px-4 text-sm whitespace-nowrap transition-colors duration-200"
        :class="model === opt.value
          ? 'border-text bg-text font-semibold text-bg'
          : 'border-border bg-surface text-muted hover:text-text'"
        :aria-pressed="model === opt.value"
        @click="model = opt.value"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>
