<script setup lang="ts">
import {Check, ChevronRight} from '@lucide/vue';
import {useLocalStorage} from '@vueuse/core';
import {computed} from 'vue';
import Disclosure from '@/components/Disclosure.vue';
import PageHeader from '@/components/PageHeader.vue';
import {useTheme} from '@/composables/useTheme';
import {SCENARIOS, SETTING_CHECKS} from '@/content/coach';

// 原生相機教練：設定健檢（勾完代表手機準備好了）+ 情境速查 + App 本身的外觀設定。
// 勾選狀態是這支手機的個人進度，存 localStorage 就夠（讀不到時從頭開始）。
const checked = useLocalStorage<string[]>('lumina:settings-checked', []);
const checkedSet = computed(() => new Set(checked.value));
const doneCount = computed(() => SETTING_CHECKS.filter((s) => checkedSet.value.has(s.id)).length);

function toggle(id: string) {
  checked.value = checkedSet.value.has(id) ? checked.value.filter((x) => x !== id) : [...checked.value, id];
}

const {preference} = useTheme();
const THEME_OPTIONS = [
  {value: 'auto', label: '跟隨系統'},
  {value: 'light', label: '淺色'},
  {value: 'dark', label: '深色'},
] as const;
</script>

<template>
  <main class="space-y-4">
    <div>
      <PageHeader title="教練" />
      <p class="mt-1 text-muted">先把 iPhone 相機設定好，再看各種情境怎麼拍。</p>
    </div>

    <section class="card p-5" aria-labelledby="settings-title">
      <div class="flex items-baseline justify-between gap-3">
        <h2 id="settings-title" class="text-lg font-bold">相機設定健檢</h2>
        <p class="shrink-0 text-sm text-muted">
          <span class="numerals text-lg text-text">{{ doneCount }}</span> / {{ SETTING_CHECKS.length }} 項
        </p>
      </div>
      <p class="mt-1 text-sm text-muted">照著路徑去設定，設好了就勾起來。</p>

      <ul class="mt-3 divide-y divide-border">
        <li v-for="item in SETTING_CHECKS" :key="item.id">
          <button
            type="button"
            role="checkbox"
            :aria-checked="checkedSet.has(item.id)"
            class="flex w-full gap-3.5 py-3.5 text-left"
            @click="toggle(item.id)"
          >
            <span
              class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 transition-colors duration-200"
              :class="checkedSet.has(item.id) ? 'border-gold bg-gold text-[#1d1b33]' : 'border-border'"
              aria-hidden="true"
            >
              <Check v-if="checkedSet.has(item.id)" :size="16" :stroke-width="3" />
            </span>
            <span class="min-w-0">
              <span class="block font-semibold">{{ item.title }}</span>
              <span class="mt-1 flex flex-wrap items-center gap-0.5 text-sm text-accent-ink">
                <template v-for="(step, i) in item.path" :key="step">
                  <ChevronRight v-if="i > 0" :size="14" class="text-muted" aria-hidden="true" />
                  <span>{{ step }}</span>
                </template>
              </span>
              <span class="mt-1 block text-sm leading-relaxed text-muted">{{ item.why }}</span>
            </span>
          </button>
        </li>
      </ul>
      <p v-if="doneCount === SETTING_CHECKS.length" class="mt-2 rounded-xl bg-gold-soft px-3.5 py-2.5 text-sm font-semibold text-gold-ink" role="status">
        全部設定好了，可以出門拍了。
      </p>
      <p class="mt-3 text-xs text-muted">選項名稱以 iOS 26 為準，不同機型或版本可能略有不同。</p>
    </section>

    <section class="card px-5 py-2" aria-labelledby="scenarios-title">
      <h2 id="scenarios-title" class="pt-3 text-lg font-bold">情境速查</h2>
      <ul class="divide-y divide-border">
        <li v-for="s in SCENARIOS" :key="s.id">
          <Disclosure :title="s.title">
            <div class="pb-4">
              <p class="leading-relaxed text-muted">{{ s.summary }}</p>
              <ol class="mt-3 space-y-2">
                <li v-for="(step, i) in s.steps" :key="i" class="flex gap-3 leading-relaxed">
                  <span class="numerals mt-px text-muted">{{ i + 1 }}</span>{{ step }}
                </li>
              </ol>
            </div>
          </Disclosure>
        </li>
      </ul>
    </section>

    <section class="card p-5" aria-labelledby="appearance-title">
      <h2 id="appearance-title" class="font-bold">外觀</h2>
      <div class="mt-3 flex rounded-full bg-surface-strong p-0.5 text-sm" role="radiogroup" aria-labelledby="appearance-title">
        <button
          v-for="opt in THEME_OPTIONS"
          :key="opt.value"
          type="button"
          role="radio"
          :aria-checked="preference === opt.value"
          class="h-9 flex-1 rounded-full transition-colors duration-200"
          :class="preference === opt.value ? 'bg-surface font-semibold shadow-sm' : 'text-muted'"
          @click="preference = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </section>

    <router-link :to="{name: 'lab-pip'}" class="block py-2 text-center text-sm text-accent-ink">
      實驗功能：把姿勢卡浮在原生相機上
    </router-link>
  </main>
</template>
