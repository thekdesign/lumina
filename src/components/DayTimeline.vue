<script setup lang="ts">
import {computed, ref} from 'vue';
import type {Place} from '@/content/places';
import {PERIOD_LABEL, PHASE_LABEL} from '@/content/light';
import {formatDuration} from '@/lib/duration';
import {daySegments, lightWindows, type LightPhase} from '@/lib/sun';
import {formatClock, startOfDayInZone} from '@/lib/zone';

// 一天的光線色帶 + 四個時段的時間表，可切今天 / 明天（規劃隔天早起拍時用）
const props = defineProps<{place: Place; now: Date}>();

const DAY_MS = 86400000;
const offset = ref<0 | 1>(0);

const dayStart = computed(() => {
  const today = startOfDayInZone(props.now, props.place.timeZone);
  return offset.value === 0 ? today : startOfDayInZone(new Date(today.getTime() + DAY_MS * 1.5), props.place.timeZone);
});

const segments = computed(() => daySegments(dayStart.value, props.place.lat, props.place.lng).map((s) => ({
  ...s,
  width: (s.end.getTime() - s.start.getTime()) / DAY_MS * 100,
})));

const windows = computed(() => lightWindows(dayStart.value, props.place.lat, props.place.lng).map((w) => ({
  key: `${w.period}-${w.kind}`,
  kind: w.kind,
  label: `${PERIOD_LABEL[w.period]}${PHASE_LABEL[w.kind]}`,
  range: `${formatClock(w.start, props.place.timeZone)} – ${formatClock(w.end, props.place.timeZone)}`,
  duration: formatDuration(w.end.getTime() - w.start.getTime()),
  past: w.end <= props.now,
  active: w.start <= props.now && props.now < w.end,
})));

const nowPercent = computed(() => offset.value === 0
  ? (props.now.getTime() - dayStart.value.getTime()) / DAY_MS * 100
  : undefined);

const PHASE_COLOR: Record<LightPhase, string> = {
  night: 'bg-phase-night',
  blue: 'bg-phase-blue',
  golden: 'bg-phase-golden',
  day: 'bg-phase-day',
};
const LEGEND: LightPhase[] = ['night', 'blue', 'golden', 'day'];
</script>

<template>
  <section class="card p-5" aria-labelledby="timeline-title">
    <div class="flex items-center justify-between">
      <h2 id="timeline-title" class="text-lg font-bold">{{ offset === 0 ? '今天' : '明天' }}的光</h2>
      <div class="flex rounded-full bg-surface-strong p-0.5 text-sm" role="group" aria-label="選擇日期">
        <button
          v-for="(label, i) in ['今天', '明天']"
          :key="label"
          type="button"
          class="h-8 rounded-full px-3.5 transition-colors duration-200"
          :class="offset === i ? 'bg-surface font-semibold shadow-sm' : 'text-muted'"
          :aria-pressed="offset === i"
          @click="offset = i as 0 | 1"
        >
          {{ label }}
        </button>
      </div>
    </div>

    <div class="relative mt-5">
      <div class="flex h-3 overflow-hidden rounded-full" aria-hidden="true">
        <div v-for="s in segments" :key="s.start.getTime()" :class="PHASE_COLOR[s.phase]" :style="{width: `${s.width}%`}" />
      </div>
      <div
        v-if="nowPercent !== undefined"
        class="absolute -top-1.5 h-6 w-0.5 -translate-x-1/2 rounded-full bg-text"
        :style="{left: `${nowPercent}%`}"
        aria-hidden="true"
      />
      <div class="numerals mt-1.5 flex justify-between text-xs text-muted" aria-hidden="true">
        <span v-for="h in [0, 6, 12, 18, 24]" :key="h">{{ h }}</span>
      </div>
    </div>

    <ul class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="色帶圖例">
      <li v-for="p in LEGEND" :key="p" class="flex items-center gap-1.5">
        <span class="size-2 rounded-full" :class="PHASE_COLOR[p]" aria-hidden="true" />{{ PHASE_LABEL[p] }}
      </li>
    </ul>

    <ul v-if="windows.length" class="mt-4 divide-y divide-border">
      <li
        v-for="w in windows"
        :key="w.key"
        class="flex items-center gap-3 py-3 transition-opacity"
        :class="{'opacity-45': w.past}"
      >
        <span class="size-2.5 shrink-0 rounded-full" :class="PHASE_COLOR[w.kind]" aria-hidden="true" />
        <span class="flex-1" :class="{'font-semibold': w.active}">
          {{ w.label }}<span v-if="w.past" class="sr-only">（已過）</span>
        </span>
        <span class="numerals text-[17px]">{{ w.range }}</span>
        <span v-if="w.active" class="w-14 rounded-full bg-gold-soft py-0.5 text-center text-xs font-semibold text-gold-ink">進行中</span>
        <span v-else class="w-14 text-right text-sm text-muted">{{ w.duration }}</span>
      </li>
    </ul>
    <p v-else class="mt-4 text-sm text-muted">這一天沒有藍調和黃金時刻。</p>
  </section>
</template>
