<script setup lang="ts">
import {Heart} from '@lucide/vue';
import {computed, ref, shallowRef} from 'vue';
import FilterChips from '@/components/FilterChips.vue';
import PageHeader from '@/components/PageHeader.vue';
import PoseDetailSheet from '@/components/PoseDetailSheet.vue';
import PoseFigure from '@/components/PoseFigure.vue';
import {useShotList} from '@/composables/useShotList';
import {CATEGORY_LABEL, FRAMING_LABEL, POSES, type Pose, type PoseCategory} from '@/content/poses';

const {isFavorite, favorites} = useShotList();

// 'saved'＝只看收藏
const category = ref<PoseCategory | 'saved'>();
const CATEGORY_OPTIONS = [
  {value: 'saved' as const, label: '收藏'},
  ...(Object.keys(CATEGORY_LABEL) as PoseCategory[]).map((value) => ({value, label: CATEGORY_LABEL[value]})),
];

const visible = computed(() => {
  if (category.value === 'saved') {
    // 依收藏的先後順序
    return favorites.value.map((id) => POSES.find((p) => p.id === id)).filter((p): p is Pose => !!p);
  }
  return category.value ? POSES.filter((p) => p.category === category.value) : POSES;
});

const selected = shallowRef<Pose>();
const sheetOpen = ref(false);
function openPose(pose: Pose) {
  selected.value = pose;
  sheetOpen.value = true;
}
</script>

<template>
  <main>
    <PageHeader title="姿勢" />
    <p class="mt-1 text-muted">點開看口令，還有拍的人要站多高、用幾倍鏡頭。</p>

    <div class="mt-4">
      <FilterChips v-model="category" :options="CATEGORY_OPTIONS" label="姿勢分類" />
    </div>

    <ul class="mt-4 grid grid-cols-2 gap-3">
      <li v-for="pose in visible" :key="pose.id">
        <button
          type="button"
          class="press card group block w-full p-2.5 text-left"
          @click="openPose(pose)"
        >
          <span class="relative block aspect-[4/5] rounded-[0.9rem] bg-bg p-2 transition-colors duration-200 group-hover:bg-surface-strong">
            <PoseFigure :pose="pose" />
            <Heart v-if="isFavorite(pose.id)" :size="18" class="absolute top-2 right-2 fill-gold text-gold-ink" aria-label="已收藏" />
          </span>
          <span class="mt-2.5 block px-1 leading-snug font-semibold">{{ pose.title }}</span>
          <span class="mt-0.5 block px-1 pb-1 text-sm text-muted">
            {{ FRAMING_LABEL[pose.framing] }}<template v-if="!category || category === 'saved'">，{{ CATEGORY_LABEL[pose.category] }}</template>
          </span>
        </button>
      </li>
    </ul>
    <div v-if="!visible.length" class="mt-4 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
      <Heart :size="28" class="mx-auto text-muted" aria-hidden="true" />
      <p class="mt-3 font-semibold">還沒有收藏的姿勢</p>
      <p class="mt-1 text-sm text-muted">打開任何一個姿勢，按「收藏」就會出現在這裡。</p>
    </div>

    <PoseDetailSheet v-model:open="sheetOpen" :pose="selected" />
  </main>
</template>
