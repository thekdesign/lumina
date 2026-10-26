<script setup lang="ts">
import {computed} from 'vue';
import type {Pose} from '@/content/poses';
import {cameraY, personShapes} from '@/lib/figure';

// 姿勢示意圖：線條人形 + 場景道具 + 左側的相機高度標記（虛線＝鏡頭應該在的高度）。
// 主角用墨色、另一個人用靛藍，雙人照才分得出誰是誰。
const props = defineProps<{pose: Pose; showCamera?: boolean}>();

// 全部維持 4:5：全身／遠景看整張，半身放大看上半身
const VIEWBOX = {full: '0 0 120 150', wide: '0 0 120 150', half: '24 0 72 90'} as const;
const viewBox = computed(() => VIEWBOX[props.pose.framing]);
const left = computed(() => props.pose.framing === 'half' ? 24 : 0);
const right = computed(() => props.pose.framing === 'half' ? 96 : 120);

const people = computed(() => props.pose.people.map((p) => ({
  tone: p.tone,
  ...personShapes(p, {legs: props.pose.framing !== 'half'}),
})));
const camY = computed(() => cameraY(props.pose.people[0], props.pose.camera.height));
</script>

<template>
  <svg :viewBox="viewBox" class="block h-full w-full" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-for="(prop, i) in pose.props" :key="i">
      <path v-if="prop.kind === 'fill'" :d="prop.d" class="fill-surface-strong" />
      <path v-else-if="prop.kind === 'object'" :d="prop.d" class="fill-gold" />
      <path v-else-if="prop.kind === 'guide'" :d="prop.d" class="stroke-accent" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.6" />
      <path v-else :d="prop.d" class="stroke-muted" stroke-width="1.4" opacity="0.55" />
    </template>

    <g v-for="(p, i) in people" :key="i" :class="p.tone === 'main' ? 'stroke-text' : 'stroke-accent'" :stroke-width="p.stroke">
      <path v-for="(d, j) in p.paths" :key="j" :d="d" />
      <circle :cx="p.head.cx" :cy="p.head.cy" :r="p.head.r" :class="p.tone === 'main' ? 'fill-text' : 'fill-accent'" stroke="none" />
    </g>

    <g v-if="showCamera" class="text-gold-ink">
      <line :x1="left + 10" :x2="right" :y1="camY" :y2="camY" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2 2.5" opacity="0.7" />
      <rect :x="left + 1.5" :y="camY - 3" width="7" height="6" rx="1.2" fill="currentColor" />
      <circle :cx="left + 5" :cy="camY" r="1.6" class="fill-surface" />
    </g>
  </svg>
</template>
