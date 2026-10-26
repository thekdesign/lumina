<script setup lang="ts">
import {Camera, Grid3x3, ListChecks, PersonStanding, Sun} from '@lucide/vue';
import {useRoute} from 'vue-router';

// 底部浮動膠囊導覽列：光線 / 姿勢 / 構圖 / 清單 / 教練。單手操作，拇指範圍內。
const route = useRoute();

const TABS = [
  {name: 'light', label: '光線', icon: Sun},
  {name: 'poses', label: '姿勢', icon: PersonStanding},
  {name: 'compose', label: '構圖', icon: Grid3x3},
  {name: 'list', label: '清單', icon: ListChecks},
  {name: 'coach', label: '教練', icon: Camera},
] as const;
</script>

<template>
  <div class="mx-auto min-h-svh max-w-md px-4 pb-32" style="padding-top: max(env(safe-area-inset-top), 12px)">
    <router-view v-slot="{Component}">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <nav
      class="fixed inset-x-0 z-20 mx-auto flex max-w-md justify-center px-4"
      style="bottom: max(env(safe-area-inset-bottom), 14px)"
      aria-label="主要導覽"
    >
      <div class="flex w-full items-center justify-between rounded-full border border-border bg-surface/90 p-1.5 shadow-lg shadow-black/5 backdrop-blur-md">
        <router-link
          v-for="tab in TABS"
          :key="tab.name"
          :to="{name: tab.name}"
          class="press flex h-13 flex-1 flex-col items-center justify-center gap-0.5 rounded-full transition-colors duration-200"
          :class="route.name === tab.name ? 'bg-surface-strong text-accent-ink' : 'text-muted hover:text-text'"
          :aria-current="route.name === tab.name ? 'page' : undefined"
        >
          <component :is="tab.icon" :size="21" :stroke-width="route.name === tab.name ? 2.2 : 1.8" aria-hidden="true" />
          <span class="text-[11px] leading-none" :class="route.name === tab.name ? 'font-semibold' : ''">{{ tab.label }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>
