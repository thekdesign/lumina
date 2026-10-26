<script setup lang="ts">
import {computed, ref, shallowRef} from 'vue';
import FilterChips from '@/components/FilterChips.vue';
import PageHeader from '@/components/PageHeader.vue';
import PoseDetailSheet from '@/components/PoseDetailSheet.vue';
import PoseFigure from '@/components/PoseFigure.vue';
import {CATEGORY_LABEL, FRAMING_LABEL, POSES, type Pose, type PoseCategory} from '@/content/poses';

const category = ref<PoseCategory>();
const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABEL) as PoseCategory[]).map((value) => ({value, label: CATEGORY_LABEL[value]}));

const visible = computed(() => category.value ? POSES.filter((p) => p.category === category.value) : POSES);

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
          <span class="block aspect-[4/5] rounded-[0.9rem] bg-bg p-2 transition-colors duration-200 group-hover:bg-surface-strong">
            <PoseFigure :pose="pose" />
          </span>
          <span class="mt-2.5 block px-1 leading-snug font-semibold">{{ pose.title }}</span>
          <span class="mt-0.5 block px-1 pb-1 text-sm text-muted">
            {{ FRAMING_LABEL[pose.framing] }}<template v-if="!category">，{{ CATEGORY_LABEL[pose.category] }}</template>
          </span>
        </button>
      </li>
    </ul>

    <PoseDetailSheet v-model:open="sheetOpen" :pose="selected" />
  </main>
</template>
