<script setup lang="ts">
import {ArrowUpDown, Lightbulb, ZoomIn} from '@lucide/vue';
import BottomSheet from '@/components/BottomSheet.vue';
import PoseFigure from '@/components/PoseFigure.vue';
import {CAMERA_HEIGHT_LABEL, CATEGORY_LABEL, FRAMING_LABEL, type Pose} from '@/content/poses';

const props = defineProps<{pose?: Pose}>();
const open = defineModel<boolean>('open', {required: true});
</script>

<template>
  <BottomSheet v-model:open="open" :title="props.pose?.title ?? ''">
    <div v-if="pose" class="-mt-2 max-h-[70svh] overflow-y-auto pb-1">
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
      <slot name="actions" />
    </div>
  </BottomSheet>
</template>
