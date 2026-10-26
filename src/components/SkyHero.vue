<script setup lang="ts">
import {computed} from 'vue';
import type {Place} from '@/content/places';
import {PERIOD_LABEL, PHASE_LABEL} from '@/content/light';
import {splitDuration} from '@/lib/duration';
import {phaseOf, skyColors, sunAltitude, upcomingWindow} from '@/lib/sun';
import {formatClock, startOfDayInZone} from '@/lib/zone';

// 首頁主視覺：上半是天空（顏色依「現在」太陽的實際高度角算出來，太陽也畫在對應的高度），
// 下半是深色地面，放倒數。觀景窗四角括號＝「這是你等一下要拍的畫面」。
const props = defineProps<{place?: Place; now: Date}>();

// 沒有地點時，用黃金時刻的天空當示意
const altitude = computed(() => props.place ? sunAltitude(props.now, props.place.lat, props.place.lng) : 2);
const phase = computed(() => phaseOf(altitude.value));
const sky = computed(() => skyColors(altitude.value));

// 太陽位置：橫軸＝一天中的時間，縱軸＝高度角（-4° 時剛好一半在地平線下，60° 貼近天頂但不出框）
const sunStyle = computed(() => {
  let dayFraction = 0.72;
  if (props.place) {
    const start = startOfDayInZone(props.now, props.place.timeZone).getTime();
    dayFraction = (props.now.getTime() - start) / 86400000;
  }
  const height = Math.min(Math.max((altitude.value + 4) / 64, 0), 1);
  return {
    left: `${8 + dayFraction * 84}%`,
    bottom: `calc(${height} * (100% - 44px) - 28px)`,
  };
});

// 天黑後的星星：位置固定（不用亂數，避免每次重繪跳動），夜晚全亮、藍調時刻淡淡的
const STARS = [
  [12, 22, 1.5], [24, 48, 1], [33, 16, 1], [46, 34, 1.5], [58, 12, 1], [64, 52, 1],
  [73, 26, 1.5], [84, 14, 1], [90, 42, 1], [18, 64, 1], [52, 66, 1], [80, 62, 1.5],
] as const;
const starOpacity = computed(() => ({night: 0.85, blue: 0.35, golden: 0, day: 0}[phase.value]));

const upcoming = computed(() => props.place
  ? upcomingWindow(props.now, props.place.lat, props.place.lng, props.place.timeZone)
  : undefined);

const countdown = computed(() => {
  const w = upcoming.value;
  if (!w) {
    return undefined;
  }
  const active = w.start <= props.now;
  const name = `${PERIOD_LABEL[w.period]}${PHASE_LABEL[w.kind]}`;
  const tz = props.place!.timeZone;
  // 不是今天（當地日期）的時段，前面標「明天」
  const isToday = startOfDayInZone(w.start, tz).getTime() === startOfDayInZone(props.now, tz).getTime();
  return {
    active,
    lead: active ? `${name}進行中，還剩` : `現在是${PHASE_LABEL[phase.value]}，距離${isToday ? '' : '明天'}${name}`,
    ...splitDuration((active ? w.end : w.start).getTime() - props.now.getTime()),
    range: `${formatClock(w.start, tz)} – ${formatClock(w.end, tz)}`,
  };
});
</script>

<template>
  <section class="overflow-hidden rounded-[1.75rem] shadow-xl shadow-[#1d1b33]/10" aria-label="現在的光線">
    <div
      class="relative h-44 overflow-hidden"
      :style="{background: `linear-gradient(to bottom, ${sky.zenith}, ${sky.horizon})`}"
      aria-hidden="true"
    >
      <span
        v-for="([x, y, r], i) in STARS"
        :key="i"
        class="absolute rounded-full bg-white transition-opacity duration-700"
        :style="{left: `${x}%`, top: `${y}%`, width: `${r * 2}px`, height: `${r * 2}px`, opacity: starOpacity}"
      />
      <div class="absolute" :style="sunStyle">
        <div class="sun-rise -translate-x-1/2">
          <div
            class="size-14 rounded-full"
            :class="phase === 'night' || phase === 'blue' ? 'opacity-0' : ''"
            style="background: radial-gradient(circle, #fff3d6 0%, #f6c065 45%, #e9a23b 70%, transparent 72%); box-shadow: 0 0 48px 12px rgb(246 192 101 / 0.45)"
          />
        </div>
      </div>
      <span class="absolute top-4 left-4 h-5 w-5 border-t-2 border-l-2 border-white/80" />
      <span class="absolute top-4 right-4 h-5 w-5 border-t-2 border-r-2 border-white/80" />
      <span class="absolute bottom-4 left-4 h-5 w-5 border-b-2 border-l-2 border-white/80" />
      <span class="absolute right-4 bottom-4 h-5 w-5 border-r-2 border-b-2 border-white/80" />
    </div>

    <div class="bg-ground px-6 pt-5 pb-6 text-white">
      <slot v-if="!place" name="empty" />
      <template v-else-if="countdown">
        <p class="text-[15px] text-white/80">{{ countdown.lead }}</p>
        <p class="numerals mt-1 flex items-baseline gap-1.5 leading-none" role="timer" aria-live="off">
          <template v-if="countdown.hours > 0">
            <span class="text-[64px] font-medium">{{ countdown.hours }}</span>
            <span class="mr-2 font-sans text-lg text-white/80">小時</span>
          </template>
          <span class="text-[64px] font-medium">{{ countdown.minutes }}</span>
          <span class="font-sans text-lg text-white/80">分</span>
        </p>
        <p class="numerals mt-3 text-lg" :class="upcoming?.kind === 'blue' ? 'text-[#aab6f4]' : 'text-gold'">
          {{ countdown.range }}
        </p>
      </template>
      <p v-else class="text-[15px] text-white/80">
        這幾天太陽不會落到黃金時刻的高度，整天都是同一種光。
      </p>
    </div>
  </section>
</template>
