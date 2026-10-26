<script setup lang="ts">
import {LoaderCircle, LocateFixed} from '@lucide/vue';
import BottomSheet from '@/components/BottomSheet.vue';
import {PRESET_PLACES, type Place} from '@/content/places';
import {usePlace} from '@/composables/usePlace';

const open = defineModel<boolean>('open', {required: true});
const {place, status, choose, locate} = usePlace();

async function useCurrent() {
  if (await locate()) {
    open.value = false;
  }
}

function pick(p: Place) {
  choose(p);
  open.value = false;
}
</script>

<template>
  <BottomSheet v-model:open="open" title="在哪裡拍">
    <button
      type="button"
      class="press flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-accent font-semibold text-on-accent disabled:opacity-60"
      :disabled="status === 'locating'"
      @click="useCurrent"
    >
      <LoaderCircle v-if="status === 'locating'" :size="20" class="animate-spin motion-reduce:animate-none" aria-hidden="true" />
      <LocateFixed v-else :size="20" aria-hidden="true" />
      {{ status === 'locating' ? '定位中' : '使用目前位置' }}
    </button>
    <p v-if="status === 'denied'" class="mt-2 text-sm text-gold-ink" role="alert">
      沒有定位權限。到「設定 &gt; 隱私權 &gt; 定位服務」打開，或直接從下面選城市。
    </p>
    <p v-else-if="status === 'unavailable'" class="mt-2 text-sm text-gold-ink" role="alert">
      這次沒抓到位置，可以再試一次，或從下面選城市。
    </p>
    <p v-else class="mt-2 text-sm text-muted">位置只用來算日出日落，只存在這支手機。</p>

    <p class="mt-5 mb-2 text-sm text-muted">或選城市</p>
    <ul class="grid grid-cols-3 gap-2">
      <li v-for="p in PRESET_PLACES" :key="p.name">
        <button
          type="button"
          class="press h-11 w-full rounded-xl border transition-colors"
          :class="place?.source === 'preset' && place.name === p.name
            ? 'border-accent bg-accent-soft font-semibold text-accent-ink'
            : 'border-border hover:bg-surface-strong'"
          :aria-pressed="place?.source === 'preset' && place.name === p.name"
          @click="pick(p)"
        >
          {{ p.name }}
        </button>
      </li>
    </ul>
  </BottomSheet>
</template>
