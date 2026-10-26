<script setup lang="ts">
import {nextTick, ref, watch} from 'vue';

// 原生 <dialog> 做的底部面板：focus trap、Esc 關閉、背景 inert 都由瀏覽器處理。
const props = defineProps<{title: string}>();
const open = defineModel<boolean>('open', {required: true});
const dialog = ref<HTMLDialogElement>();

watch(open, async (value) => {
  await nextTick();
  if (value && !dialog.value?.open) {
    dialog.value?.showModal();
  } else if (!value && dialog.value?.open) {
    dialog.value.close();
  }
}, {immediate: true});

// 點到遮罩（dialog 本身，不是裡面的內容）就關閉
function onClick(event: MouseEvent) {
  if (event.target === dialog.value) {
    open.value = false;
  }
}
</script>

<template>
  <dialog ref="dialog" class="sheet" :aria-label="props.title" @close="open = false" @click="onClick">
    <div class="px-5 pt-3" style="padding-bottom: max(env(safe-area-inset-bottom), 20px)">
      <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden="true" />
      <h2 class="mb-4 text-lg font-bold">{{ props.title }}</h2>
      <slot />
    </div>
  </dialog>
</template>
