<script setup lang="ts">
// 取景框裡的構圖參考線（3:4 座標，拉伸鋪滿取景框）
export type GridMode = 'thirds' | 'diagonal' | 'center' | 'off';
defineProps<{mode: GridMode}>();
</script>

<template>
  <svg v-if="mode !== 'off'" viewBox="0 0 300 400" preserveAspectRatio="none" class="pointer-events-none absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
    <g stroke="rgb(255 255 255 / 0.7)" stroke-width="1" vector-effect="non-scaling-stroke" style="filter: drop-shadow(0 0 1px rgb(0 0 0 / 0.6))">
      <path v-if="mode === 'thirds'" d="M100 0 V400 M200 0 V400 M0 133.3 H300 M0 266.7 H300" vector-effect="non-scaling-stroke" />
      <path v-else-if="mode === 'diagonal'" d="M0 0 L300 400 M300 0 L0 400" vector-effect="non-scaling-stroke" />
      <path v-else-if="mode === 'center'" d="M150 0 V400 M0 200 H300" vector-effect="non-scaling-stroke" />
    </g>
  </svg>
</template>
