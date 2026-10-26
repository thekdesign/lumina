<script setup lang="ts">
import {ChevronDown} from '@lucide/vue';
import {ref, useId} from 'vue';

defineProps<{title: string}>();
const open = ref(false);
const panelId = useId();
</script>

<template>
  <div>
    <button
      type="button"
      class="flex min-h-13 w-full items-center justify-between gap-3 text-left font-semibold"
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="open = !open"
    >
      {{ title }}
      <ChevronDown
        :size="20"
        class="shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none"
        :class="{'rotate-180': open}"
        aria-hidden="true"
      />
    </button>
    <div :id="panelId" class="collapse-grid" :data-open="open" :inert="!open">
      <div>
        <slot />
      </div>
    </div>
  </div>
</template>
