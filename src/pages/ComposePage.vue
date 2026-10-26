<script setup lang="ts">
import {Grid3x3} from '@lucide/vue';
import CompositionDiagram from '@/components/CompositionDiagram.vue';
import Disclosure from '@/components/Disclosure.vue';
import PageHeader from '@/components/PageHeader.vue';
import {COMPOSITION_RULES} from '@/content/composition';
</script>

<template>
  <main>
    <PageHeader title="構圖" />
    <p class="mt-1 text-muted">先知道主角放哪裡，再按快門。</p>

    <aside class="mt-4 flex gap-3 rounded-2xl bg-accent-soft p-4">
      <Grid3x3 :size="22" class="mt-0.5 shrink-0 text-accent-ink" aria-hidden="true" />
      <p class="leading-relaxed">
        <strong class="font-semibold">先打開格線。</strong>到 iPhone 的「設定 &gt; 相機」打開「格線」和「水平儀」，下面每一種構圖都用得到。
      </p>
    </aside>

    <ul class="mt-4 space-y-3">
      <li v-for="rule in COMPOSITION_RULES" :key="rule.id" class="card p-2.5">
        <div class="aspect-[4/3] overflow-hidden rounded-[0.9rem] bg-bg">
          <CompositionDiagram :id="rule.id" />
        </div>
        <div class="px-2.5 pt-3">
          <h2 class="text-lg font-bold">{{ rule.name }}</h2>
          <p class="mt-1 leading-relaxed">{{ rule.summary }}</p>
          <Disclosure title="怎麼拍">
            <div class="space-y-4 pb-3">
              <ol class="space-y-1.5">
                <li v-for="(step, i) in rule.how" :key="i" class="flex gap-2.5 leading-relaxed">
                  <span class="numerals text-muted">{{ i + 1 }}</span>{{ step }}
                </li>
              </ol>
              <div>
                <h3 class="text-sm text-muted">適合拍</h3>
                <ul class="mt-1.5 flex flex-wrap gap-1.5">
                  <li v-for="tag in rule.goodFor" :key="tag" class="rounded-full bg-surface-strong px-3 py-1 text-sm">{{ tag }}</li>
                </ul>
              </div>
              <div>
                <h3 class="text-sm text-muted">常見錯誤</h3>
                <p class="mt-0.5 leading-relaxed">{{ rule.avoid }}</p>
              </div>
              <div class="rounded-xl bg-gold-soft px-3.5 py-3">
                <h3 class="text-sm text-gold-ink">用原生相機</h3>
                <p class="mt-0.5 leading-relaxed">{{ rule.iphone }}</p>
              </div>
            </div>
          </Disclosure>
        </div>
      </li>
    </ul>
  </main>
</template>
