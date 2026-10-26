<script setup lang="ts">
import {ArrowDown, ArrowUp, Check, Plus, Trash2} from '@lucide/vue';
import {computed, ref, shallowRef} from 'vue';
import PageHeader from '@/components/PageHeader.vue';
import PoseDetailSheet from '@/components/PoseDetailSheet.vue';
import PoseFigure from '@/components/PoseFigure.vue';
import {useShotList} from '@/composables/useShotList';
import {CAMERA_HEIGHT_LABEL, POSES, type Pose} from '@/content/poses';

// 拍攝清單：出門前排好要拍的幾張，到現場照順序拍、拍完勾掉。
const list = useShotList();
const {items, status, doneCount} = list;

const editing = ref(false);
const draft = ref('');

const POSE_BY_ID = new Map(POSES.map((p) => [p.id, p]));
const rows = computed(() => items.value.map((item, index) => {
  const pose = item.poseId ? POSE_BY_ID.get(item.poseId) : undefined;
  return {
    ...item,
    index,
    pose,
    title: pose?.title ?? item.note ?? '',
    detail: pose ? `${CAMERA_HEIGHT_LABEL[pose.camera.height]}，${pose.camera.zoom}` : '自己加的',
  };
}));

const progress = computed(() => items.value.length ? doneCount.value / items.value.length * 100 : 0);

function submitNote() {
  list.addNote(draft.value);
  draft.value = '';
}

function clearAll() {
  if (window.confirm('清空整份清單？這個動作不能復原。')) {
    list.clearAll();
    editing.value = false;
  }
}

const selected = shallowRef<Pose>();
const sheetOpen = ref(false);
function openPose(pose?: Pose) {
  if (!pose || editing.value) {
    return;
  }
  selected.value = pose;
  sheetOpen.value = true;
}
</script>

<template>
  <main>
    <PageHeader title="清單">
      <button
        v-if="items.length"
        type="button"
        class="press h-10 rounded-full px-4 font-semibold transition-colors"
        :class="editing ? 'bg-text text-bg' : 'text-accent-ink'"
        @click="editing = !editing"
      >
        {{ editing ? '完成' : '編輯' }}
      </button>
    </PageHeader>

    <p v-if="status === 'memory-only'" class="mt-2 rounded-xl bg-gold-soft px-3.5 py-2.5 text-sm text-gold-ink" role="status">
      這個瀏覽器不能存資料（可能是無痕模式），關掉 App 後清單不會保留。
    </p>

    <div v-if="status === 'loading'" class="mt-4 space-y-2" aria-busy="true" aria-label="載入中">
      <div v-for="i in 3" :key="i" class="card h-20 animate-pulse motion-reduce:animate-none" />
    </div>

    <template v-else>
      <section v-if="items.length" class="mt-3" aria-label="進度">
        <p class="flex items-baseline gap-1.5">
          <span class="text-muted">已拍</span>
          <span class="numerals text-2xl">{{ doneCount }}</span>
          <span class="text-muted">/</span>
          <span class="numerals text-2xl">{{ items.length }}</span>
          <span class="text-muted">張</span>
        </p>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-strong" role="progressbar" :aria-valuenow="doneCount" aria-valuemin="0" :aria-valuemax="items.length" aria-label="拍攝進度">
          <div class="h-full rounded-full bg-gold transition-[width] duration-300 ease-out motion-reduce:transition-none" :style="{width: `${progress}%`}" />
        </div>
      </section>

      <div v-else class="mt-4 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
        <p class="font-semibold">還沒有要拍的照片</p>
        <p class="mt-1 text-sm text-muted">出門前先挑好姿勢排進來，到現場照順序拍，拍完一張勾一張。</p>
        <router-link :to="{name: 'poses'}" class="press mt-5 inline-flex h-11 items-center rounded-2xl bg-accent px-5 font-semibold text-on-accent">
          去挑姿勢
        </router-link>
      </div>

      <TransitionGroup tag="ol" name="row" class="relative mt-4 space-y-2">
        <li v-for="row in rows" :key="row.id" class="card flex items-center gap-3 p-2.5 pr-3">
          <button
            type="button"
            role="checkbox"
            :aria-checked="row.done"
            :aria-label="`第 ${row.index + 1} 張：${row.title}`"
            :disabled="editing"
            class="press grid size-11 shrink-0 place-items-center rounded-full border-2 transition-colors duration-200 disabled:opacity-40"
            :class="row.done ? 'border-gold bg-gold text-[#1d1b33]' : 'border-border text-muted'"
            @click="list.toggleDone(row.id)"
          >
            <Check v-if="row.done" :size="20" :stroke-width="2.6" aria-hidden="true" />
            <span v-else class="numerals text-lg leading-none" aria-hidden="true">{{ row.index + 1 }}</span>
          </button>

          <component
            :is="row.pose && !editing ? 'button' : 'div'"
            :type="row.pose && !editing ? 'button' : undefined"
            class="flex min-w-0 flex-1 items-center gap-3 text-left"
            @click="openPose(row.pose)"
          >
            <span v-if="row.pose" class="block h-14 w-11 shrink-0 rounded-lg bg-bg p-1">
              <PoseFigure :pose="row.pose" />
            </span>
            <span class="min-w-0 transition-opacity duration-200" :class="{'opacity-50': row.done}">
              <span class="block truncate font-semibold" :class="{'line-through decoration-muted': row.done}">{{ row.title }}</span>
              <span class="block truncate text-sm text-muted">{{ row.detail }}</span>
            </span>
          </component>

          <div v-if="editing" class="flex shrink-0 items-center">
            <button type="button" class="grid size-10 place-items-center rounded-full text-muted disabled:opacity-30" :disabled="row.index === 0" :aria-label="`把「${row.title}」往上移`" @click="list.move(row.id, -1)">
              <ArrowUp :size="19" aria-hidden="true" />
            </button>
            <button type="button" class="grid size-10 place-items-center rounded-full text-muted disabled:opacity-30" :disabled="row.index === rows.length - 1" :aria-label="`把「${row.title}」往下移`" @click="list.move(row.id, 1)">
              <ArrowDown :size="19" aria-hidden="true" />
            </button>
            <button type="button" class="grid size-10 place-items-center rounded-full text-gold-ink" :aria-label="`刪除「${row.title}」`" @click="list.remove(row.id)">
              <Trash2 :size="19" aria-hidden="true" />
            </button>
          </div>
        </li>
      </TransitionGroup>

      <form class="mt-3 flex gap-2" @submit.prevent="submitNote">
        <label for="note-input" class="sr-only">自己加一張</label>
        <input
          id="note-input"
          v-model="draft"
          type="text"
          enterkeyhint="done"
          maxlength="60"
          placeholder="自己加一張，例如：咖啡店門口全身"
          class="h-12 min-w-0 flex-1 rounded-2xl border border-border bg-surface px-4 placeholder:text-muted focus:border-accent focus:outline-none"
        >
        <button type="submit" class="press grid size-12 shrink-0 place-items-center rounded-2xl bg-text text-bg disabled:opacity-40" :disabled="!draft.trim()" aria-label="加入清單">
          <Plus :size="22" aria-hidden="true" />
        </button>
      </form>

      <div v-if="items.length" class="mt-5 flex justify-center gap-2 text-sm">
        <button v-if="doneCount && !editing" type="button" class="h-10 rounded-full px-4 text-accent-ink" @click="list.resetDone()">
          全部取消勾選
        </button>
        <button v-if="editing" type="button" class="h-10 rounded-full px-4 text-gold-ink" @click="clearAll">
          清空清單
        </button>
      </div>
    </template>

    <PoseDetailSheet v-model:open="sheetOpen" :pose="selected" from-list />
  </main>
</template>

<style scoped>
.row-move,
.row-enter-active,
.row-leave-active {
  transition: transform 0.24s cubic-bezier(0.2, 0.7, 0.3, 1), opacity 0.2s ease-out;
}
.row-enter-from,
.row-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
.row-leave-active {
  position: absolute;
  inset-inline: 0;
}
@media (prefers-reduced-motion: reduce) {
  .row-move,
  .row-enter-active,
  .row-leave-active {
    transition: none;
  }
}
</style>
