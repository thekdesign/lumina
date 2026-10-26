<script setup lang="ts">
import type {CompositionId} from '@/content/composition';

// 構圖示意圖（4:3）：淡色塊＝場景、墨色小人＝主角、靛藍虛線＝構圖參考線、琥珀點＝視線落點。
defineProps<{id: CompositionId}>();

// 小人：腳底座標 + 身高
function figure(x: number, feet: number, h: number) {
  const head = h * 0.16;
  return {
    head: {cx: x, cy: feet - h + head, r: head},
    body: `M${x} ${feet - h + head * 2} V${feet - h * 0.42} M${x - h * 0.13} ${feet} L${x} ${feet - h * 0.42} L${x + h * 0.13} ${feet} M${x - h * 0.17} ${feet - h * 0.5} L${x} ${feet - h * 0.72} L${x + h * 0.17} ${feet - h * 0.5}`,
    stroke: Math.max(h * 0.07, 1.4),
  };
}

const PEOPLE: Record<CompositionId, ReturnType<typeof figure>> = {
  'thirds': figure(53.3, 96, 34),
  'golden-spiral': figure(117, 92, 24),
  'diagonal': figure(124, 44, 18),
  'leading-lines': figure(80, 56, 14),
  'frame': figure(80, 108, 34),
  'negative-space': figure(118, 100, 20),
  'symmetry': figure(80, 112, 26),
};
</script>

<template>
  <svg viewBox="0 0 160 120" class="block h-full w-full" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <!-- 場景 -->
    <g class="fill-surface-strong stroke-muted" stroke-width="0">
      <template v-if="id === 'thirds'">
        <rect y="80" width="160" height="40" />
        <circle cx="106.7" cy="40" r="9" class="fill-gold" />
      </template>
      <template v-else-if="id === 'golden-spiral'">
        <rect y="92" width="160" height="28" />
      </template>
      <template v-else-if="id === 'diagonal'">
        <path d="M0 120 V104 L148 0 H160 V10 L24 120 Z" />
      </template>
      <template v-else-if="id === 'leading-lines'">
        <rect y="56" width="160" height="64" />
        <path d="M34 120 L77 56 H83 L126 120 Z" class="fill-bg" />
      </template>
      <template v-else-if="id === 'frame'">
        <path d="M0 0 H160 V120 H0 Z M50 120 V58 A30 30 0 0 1 110 58 V120 Z" fill-rule="evenodd" />
      </template>
      <template v-else-if="id === 'negative-space'">
        <rect y="100" width="160" height="20" />
      </template>
      <template v-else-if="id === 'symmetry'">
        <path d="M28 120 V52 L80 22 L132 52 V120 Z M62 120 V88 A18 18 0 0 1 98 88 V120 Z" fill-rule="evenodd" />
      </template>
    </g>

    <!-- 構圖參考線 -->
    <g class="stroke-accent" stroke-width="0.9" stroke-dasharray="3 3">
      <path v-if="id === 'thirds'" d="M53.3 0 V120 M106.7 0 V120 M0 40 H160 M0 80 H160" />
      <path
        v-else-if="id === 'golden-spiral'"
        d="M0 109 A98.9 98.9 0 0 1 98.9 10 A61.1 61.1 0 0 1 160 71.1 A37.8 37.8 0 0 1 122.2 109 A23.3 23.3 0 0 1 98.9 85.7 A14.4 14.4 0 0 1 113.3 71.1 A8.9 8.9 0 0 1 122.2 80"
        stroke-dasharray="none"
        stroke-width="1.2"
      />
      <path v-else-if="id === 'diagonal'" d="M0 120 L160 0" />
      <path v-else-if="id === 'leading-lines'" d="M34 120 L80 52 M126 120 L80 52" stroke-dasharray="none" stroke-width="1.2" />
      <path v-else-if="id === 'frame'" d="M50 120 V58 A30 30 0 0 1 110 58 V120" />
      <rect v-else-if="id === 'negative-space'" x="10" y="10" width="92" height="82" rx="4" />
      <path v-else-if="id === 'symmetry'" d="M80 0 V120" />
    </g>

    <!-- 主角 -->
    <g class="stroke-text" :stroke-width="PEOPLE[id].stroke">
      <path :d="PEOPLE[id].body" />
      <circle v-bind="PEOPLE[id].head" class="fill-text" stroke="none" />
    </g>

    <!-- 視線落點 -->
    <g class="fill-gold">
      <template v-if="id === 'thirds'">
        <circle v-for="[x, y] in [[53.3, 40], [106.7, 40], [53.3, 80], [106.7, 80]]" :key="`${x}-${y}`" :cx="x" :cy="y" r="2.2" />
      </template>
      <circle v-else-if="id === 'golden-spiral'" cx="117" cy="80" r="2.2" />
    </g>
  </svg>
</template>
