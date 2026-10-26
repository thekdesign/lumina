<script setup lang="ts">
import {ChevronDown, LocateFixed, MapPin} from '@lucide/vue';
import {useIntervalFn, useNow} from '@vueuse/core';
import {computed, ref} from 'vue';
import DayTimeline from '@/components/DayTimeline.vue';
import Disclosure from '@/components/Disclosure.vue';
import PlaceSheet from '@/components/PlaceSheet.vue';
import SkyHero from '@/components/SkyHero.vue';
import {usePlace} from '@/composables/usePlace';
import {LIGHT_TIPS, PHASE_ADVICE} from '@/content/light';
import {phaseOf, sunAltitude} from '@/lib/sun';

// 光線（首頁）：現在的天空與倒數 → 今天的時間表 → 現在怎麼拍 → 光線小抄
const {place, status, locate} = usePlace();
// 倒數只顯示到分鐘，15 秒更新一次就夠
const now = useNow({scheduler: (cb) => useIntervalFn(cb, 15000)});
const sheetOpen = ref(false);

const advice = computed(() => place.value
  ? PHASE_ADVICE[phaseOf(sunAltitude(now.value, place.value.lat, place.value.lng))]
  : undefined);

async function useCurrent() {
  if (!(await locate())) {
    sheetOpen.value = true;
  }
}

const TIP_ROWS = [
  {key: 'character', label: '光的樣子'},
  {key: 'how', label: '怎麼站'},
  {key: 'camera', label: '相機怎麼調'},
] as const;
</script>

<template>
  <main class="space-y-4">
    <header class="flex min-h-11 items-center justify-between gap-3 pt-2">
      <h1 class="font-display text-[30px] leading-none font-medium italic">
        Lumina<span class="sr-only"> 拾光</span>
      </h1>
      <button
        v-if="place"
        type="button"
        class="press flex h-10 items-center gap-1.5 rounded-full border border-border bg-surface pr-3 pl-3.5 text-sm"
        @click="sheetOpen = true"
      >
        <LocateFixed v-if="place.source === 'gps'" :size="16" aria-hidden="true" />
        <MapPin v-else :size="16" aria-hidden="true" />
        {{ place.name }}
        <ChevronDown :size="16" class="text-muted" aria-hidden="true" />
        <span class="sr-only">，更換地點</span>
      </button>
    </header>

    <SkyHero :place="place" :now="now">
      <template #empty>
        <p class="text-xl font-bold">先告訴我你在哪裡</p>
        <p class="mt-1.5 text-[15px] text-white/80">用位置算出今天的黃金時刻和藍調時刻。位置只存在這支手機。</p>
        <div class="mt-5 flex gap-2">
          <button
            type="button"
            class="press h-12 flex-1 rounded-2xl bg-gold font-semibold text-[#1d1b33] disabled:opacity-60"
            :disabled="status === 'locating'"
            @click="useCurrent"
          >
            {{ status === 'locating' ? '定位中' : '使用目前位置' }}
          </button>
          <button type="button" class="press h-12 flex-1 rounded-2xl border border-white/30 font-semibold" @click="sheetOpen = true">
            選城市
          </button>
        </div>
      </template>
    </SkyHero>

    <template v-if="place">
      <DayTimeline :place="place" :now="now" />

      <section v-if="advice" class="card p-5" aria-labelledby="advice-title">
        <p class="text-sm text-muted">現在怎麼拍</p>
        <h2 id="advice-title" class="mt-1 text-lg font-bold">{{ advice.title }}</h2>
        <p class="mt-2 leading-relaxed">{{ advice.body }}</p>
      </section>
    </template>

    <section class="card px-5 py-2" aria-labelledby="tips-title">
      <h2 id="tips-title" class="pt-3 pb-1 text-lg font-bold">光線小抄</h2>
      <ul class="divide-y divide-border">
        <li v-for="tip in LIGHT_TIPS" :key="tip.id">
          <Disclosure :title="tip.title">
            <dl class="space-y-3 pb-4">
              <div v-for="row in TIP_ROWS" :key="row.key">
                <dt class="text-sm text-muted">{{ row.label }}</dt>
                <dd class="mt-0.5 leading-relaxed">{{ tip[row.key] }}</dd>
              </div>
            </dl>
          </Disclosure>
        </li>
      </ul>
    </section>

    <PlaceSheet v-model:open="sheetOpen" />
  </main>
</template>
