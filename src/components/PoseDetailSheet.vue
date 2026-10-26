<script setup lang="ts">
import {ArrowUpDown, Check, ChevronRight, Heart, Lightbulb, ListPlus, ScanLine, ZoomIn} from '@lucide/vue';
import {ref, watch} from 'vue';
import BottomSheet from '@/components/BottomSheet.vue';
import PoseFigure from '@/components/PoseFigure.vue';
import {useShotList} from '@/composables/useShotList';
import {CAMERA_HEIGHT_LABEL, CATEGORY_LABEL, FRAMING_LABEL, type Pose} from '@/content/poses';

// fromList：從清單頁打開時，不再顯示「加到清單」
const props = defineProps<{pose?: Pose; fromList?: boolean}>();
const open = defineModel<boolean>('open', {required: true});
const {addPose, countInList, isFavorite, toggleFavorite} = useShotList();

// 按下「加到清單」後，按鈕短暫變成「已加到清單」當回饋
const justAdded = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;
function add() {
  if (!props.pose) {
    return;
  }
  addPose(props.pose.id);
  justAdded.value = true;
  clearTimeout(timer);
  timer = setTimeout(() => {
    justAdded.value = false;
  }, 1600);
}
watch(() => props.pose, () => {
  justAdded.value = false;
});
</script>

<template>
  <BottomSheet v-model:open="open" :title="props.pose?.title ?? ''">
    <div v-if="pose" class="-mt-2 max-h-[62svh] overflow-y-auto pb-1">
      <p class="text-sm text-muted">{{ CATEGORY_LABEL[pose.category] }}，{{ FRAMING_LABEL[pose.framing] }}</p>

      <div class="mx-auto mt-3 aspect-[4/5] w-52 rounded-2xl bg-bg p-3">
        <PoseFigure :pose="pose" show-camera />
      </div>
      <p class="mt-2 text-center text-xs text-muted">
        <span class="mr-1 inline-block h-0 w-4 border-t border-dashed border-gold-ink align-middle" aria-hidden="true" />虛線是鏡頭的高度
      </p>

      <h3 class="mt-5 font-bold">跟被拍的人說</h3>
      <ol class="mt-2 space-y-2">
        <li v-for="(cue, i) in pose.cues" :key="i" class="flex gap-3 rounded-xl bg-bg px-3.5 py-2.5 leading-relaxed">
          <span class="numerals text-muted">{{ i + 1 }}</span>
          <span>{{ cue }}</span>
        </li>
      </ol>

      <h3 class="mt-5 font-bold">拍的人</h3>
      <dl class="mt-2 grid grid-cols-2 gap-2">
        <div class="rounded-xl bg-gold-soft px-3.5 py-2.5">
          <dt class="flex items-center gap-1.5 text-sm text-gold-ink"><ArrowUpDown :size="15" aria-hidden="true" />高度</dt>
          <dd class="mt-0.5 font-semibold">{{ CAMERA_HEIGHT_LABEL[pose.camera.height] }}</dd>
        </div>
        <div class="rounded-xl bg-gold-soft px-3.5 py-2.5">
          <dt class="flex items-center gap-1.5 text-sm text-gold-ink"><ZoomIn :size="15" aria-hidden="true" />鏡頭倍率</dt>
          <dd class="numerals mt-0.5 text-lg leading-tight font-semibold">{{ pose.camera.zoom }}</dd>
        </div>
      </dl>
      <p class="mt-2 flex gap-2.5 rounded-xl border border-border px-3.5 py-3 leading-relaxed">
        <Lightbulb :size="18" class="mt-0.5 shrink-0 text-gold-ink" aria-hidden="true" />
        {{ pose.camera.tip }}
      </p>
      <router-link
        :to="{name: 'viewfinder', query: {pose: pose.id}}"
        class="press mt-2 flex items-center gap-3 rounded-xl border border-border px-3.5 py-3"
      >
        <ScanLine :size="18" class="shrink-0 text-accent-ink" aria-hidden="true" />
        <span class="flex-1">疊在相機畫面上對位</span>
        <ChevronRight :size="18" class="text-muted" aria-hidden="true" />
      </router-link>
    </div>

    <div v-if="pose" class="mt-3 flex gap-2 border-t border-border pt-3">
      <button
        type="button"
        class="press flex h-12 items-center justify-center gap-2 rounded-2xl border border-border font-semibold transition-colors"
        :class="fromList ? 'flex-1' : 'px-4'"
        :aria-pressed="isFavorite(pose.id)"
        @click="toggleFavorite(pose.id)"
      >
        <Heart
          :size="20"
          class="transition-colors duration-200"
          :class="isFavorite(pose.id) ? 'fill-gold text-gold-ink' : 'text-muted'"
          aria-hidden="true"
        />
        {{ isFavorite(pose.id) ? '已收藏' : '收藏' }}
      </button>
      <button
        v-if="!fromList"
        type="button"
        class="press flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-accent font-semibold text-on-accent"
        @click="add"
      >
        <Check v-if="justAdded" :size="20" aria-hidden="true" />
        <ListPlus v-else :size="20" aria-hidden="true" />
        <span aria-live="polite">
          {{ justAdded ? `已加到清單（第 ${countInList(pose.id)} 張）` : countInList(pose.id) ? '再加一張到清單' : '加到拍攝清單' }}
        </span>
      </button>
    </div>
  </BottomSheet>
</template>
