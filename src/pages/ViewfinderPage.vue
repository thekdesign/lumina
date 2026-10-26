<script setup lang="ts">
import {ArrowLeft, Download, Grid3x3, ImagePlus, Layers, LoaderCircle, RefreshCw, Ruler, SwitchCamera, X} from '@lucide/vue';
import {useElementSize} from '@vueuse/core';
import {computed, onBeforeUnmount, onMounted, ref, shallowRef} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import BottomSheet from '@/components/BottomSheet.vue';
import PoseFigure from '@/components/PoseFigure.vue';
import ViewfinderGrid, {type GridMode} from '@/components/ViewfinderGrid.vue';
import {useCamera} from '@/composables/useCamera';
import {useLevel} from '@/composables/useLevel';
import {CAMERA_HEIGHT_LABEL, POSES} from '@/content/poses';
import {coverSourceRect, fitFrame} from '@/lib/viewfinder';

// 對位取景器：網頁相機 + 3:4 取景框（跟原生相機直式照片一致）+ 疊姿勢 / 自己的參考照 + 格線 + 水平儀。
// 畫質比原生相機低，定位是「對位工具」：對好位置後可以直接存一張，也可以照著同樣的構圖換原生相機拍。
const route = useRoute();
const router = useRouter();

const root = ref<HTMLElement>();
const video = ref<HTMLVideoElement>();
const {width: screenW, height: screenH} = useElementSize(root);
const camera = useCamera(video);
const level = useLevel();

// 上方工具列 + 下方控制列保留的高度
const TOP = 64;
const BOTTOM = 196;
const frame = computed(() => {
  const f = fitFrame(screenW.value, Math.max(screenH.value - TOP, 0), 3 / 4, BOTTOM);
  return {...f, y: f.y + TOP};
});

// ===== 參考圖 =====
type Ghost = {kind: 'pose'; poseId: string} | {kind: 'photo'; url: string} | {kind: 'none'};
const initialPose = POSES.find((p) => p.id === route.query.pose);
const ghost = shallowRef<Ghost>(initialPose ? {kind: 'pose', poseId: initialPose.id} : {kind: 'none'});
const pose = computed(() => ghost.value.kind === 'pose' ? POSES.find((p) => p.id === (ghost.value as {poseId: string}).poseId) : undefined);
const opacity = ref(0.55);
const pickerOpen = ref(false);
const fileInput = ref<HTMLInputElement>();

function setGhost(next: Ghost) {
  if (ghost.value.kind === 'photo') {
    URL.revokeObjectURL(ghost.value.url);
  }
  ghost.value = next;
  opacity.value = next.kind === 'photo' ? 0.35 : 0.55;
  pickerOpen.value = false;
}

function onFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    setGhost({kind: 'photo', url: URL.createObjectURL(file)});
  }
  (event.target as HTMLInputElement).value = '';
}

// ===== 格線 =====
const GRID_ORDER: GridMode[] = ['thirds', 'diagonal', 'center', 'off'];
const GRID_LABEL: Record<GridMode, string> = {thirds: '三分', diagonal: '對角', center: '十字', off: '關'};
const grid = ref<GridMode>('thirds');
function cycleGrid() {
  grid.value = GRID_ORDER[(GRID_ORDER.indexOf(grid.value) + 1) % GRID_ORDER.length];
}

// ===== 水平儀 =====
const levelOk = computed(() => level.angle.value !== undefined && Math.abs(level.angle.value) < 1);
function toggleLevel() {
  if (level.status.value === 'on') {
    level.disable();
  } else {
    void level.enable();
  }
}

// ===== 拍照 =====
const shot = ref<{url: string; blob: Blob}>();
const flash = ref(false);
const saveError = ref('');

async function capture() {
  const v = video.value;
  if (!v || camera.status.value !== 'ready' || !v.videoWidth) {
    return;
  }
  const src = coverSourceRect(v.videoWidth, v.videoHeight, screenW.value, screenH.value, frame.value);
  const mirrored = camera.facing.value === 'user';
  const sx = mirrored ? v.videoWidth - src.x - src.w : src.x;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(src.w);
  canvas.height = Math.round(src.h);
  const ctx = canvas.getContext('2d')!;
  if (mirrored) {
    // 前鏡頭預覽是鏡像的，存下來也跟預覽一樣（同「鏡像前置鏡頭」打開的效果）
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(v, sx, src.y, src.w, src.h, 0, 0, canvas.width, canvas.height);

  flash.value = true;
  setTimeout(() => {
    flash.value = false;
  }, 160);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
  if (blob) {
    saveError.value = '';
    shot.value = {url: URL.createObjectURL(blob), blob};
  }
}

function discardShot() {
  if (shot.value) {
    URL.revokeObjectURL(shot.value.url);
  }
  shot.value = undefined;
}

async function saveShot() {
  if (!shot.value) {
    return;
  }
  const name = `lumina-${new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')}.jpg`;
  const file = new File([shot.value.blob], name, {type: 'image/jpeg'});
  // iOS：分享表單裡選「儲存影像」就會存進照片
  if (navigator.canShare?.({files: [file]})) {
    try {
      await navigator.share({files: [file]});
      discardShot();
    } catch (err) {
      if ((err as DOMException).name !== 'AbortError') {
        saveError.value = '沒有存成功，再試一次，或長按照片選「儲存到照片」。';
      }
    }
    return;
  }
  const a = document.createElement('a');
  a.href = shot.value.url;
  a.download = name;
  a.click();
  discardShot();
}

function goBack() {
  if (window.history.state?.back) {
    router.back();
  } else {
    void router.push({name: 'coach'});
  }
}

// 取景器是全螢幕黑底，狀態列跟著變黑，離開時還原
const themeMeta = document.querySelector('meta[name="theme-color"]');
const previousTheme = themeMeta?.getAttribute('content') ?? undefined;

onMounted(() => {
  themeMeta?.setAttribute('content', '#000000');
  void camera.start();
});

onBeforeUnmount(() => {
  if (previousTheme) {
    themeMeta?.setAttribute('content', previousTheme);
  }
  discardShot();
  if (ghost.value.kind === 'photo') {
    URL.revokeObjectURL(ghost.value.url);
  }
});
</script>

<template>
  <div ref="root" class="fixed inset-0 overflow-hidden bg-black text-white select-none">
    <video
      ref="video"
      class="absolute inset-0 h-full w-full object-cover"
      :class="{'-scale-x-100': camera.facing.value === 'user'}"
      muted
      playsinline
      aria-label="相機畫面"
    />

    <!-- 取景框：外面變暗；框裡疊參考圖、格線、水平儀 -->
    <div
      class="absolute overflow-hidden"
      :style="{left: `${frame.x}px`, top: `${frame.y}px`, width: `${frame.w}px`, height: `${frame.h}px`, boxShadow: '0 0 0 100vmax rgb(0 0 0 / 0.55)'}"
    >
      <img
        v-if="ghost.kind === 'photo'"
        :src="ghost.url"
        alt=""
        class="pointer-events-none absolute inset-0 h-full w-full object-cover"
        :style="{opacity}"
      >
      <div
        v-else-if="pose"
        class="viewfinder-figure pointer-events-none absolute inset-0 p-[4%]"
        :style="{opacity}"
      >
        <PoseFigure :pose="pose" />
      </div>

      <ViewfinderGrid v-if="camera.status.value === 'ready'" :mode="grid" />

      <div v-if="level.status.value === 'on' && level.angle.value !== undefined" class="pointer-events-none absolute inset-x-0 top-1/2 flex justify-center" aria-hidden="true">
        <div
          class="h-0.5 w-2/5 rounded-full transition-colors duration-150"
          :class="levelOk ? 'bg-gold' : 'bg-white/80'"
          :style="{transform: `rotate(${-level.angle.value}deg)`, boxShadow: '0 0 2px rgb(0 0 0 / 0.6)'}"
        />
      </div>
      <div class="pointer-events-none absolute inset-0 border border-white/40" />
      <div v-if="flash" class="absolute inset-0 bg-white motion-reduce:hidden" aria-hidden="true" />
    </div>

    <!-- 上方工具列 -->
    <div class="absolute inset-x-0 top-0 flex items-center justify-between px-3" :style="{height: `${TOP}px`, paddingTop: 'env(safe-area-inset-top)'}">
      <button type="button" class="press grid size-11 place-items-center rounded-full bg-black/35 backdrop-blur" aria-label="離開取景器" @click="goBack">
        <ArrowLeft :size="22" aria-hidden="true" />
      </button>
      <p v-if="pose" class="mx-2 min-w-0 truncate rounded-full bg-black/35 px-3 py-1.5 text-sm backdrop-blur">
        {{ pose.title }}<span class="text-white/70">，{{ CAMERA_HEIGHT_LABEL[pose.camera.height] }}</span>
      </p>
      <div class="flex gap-2">
        <button
          type="button"
          class="press grid size-11 place-items-center rounded-full backdrop-blur"
          :class="level.status.value === 'on' ? 'bg-gold text-[#1d1b33]' : 'bg-black/35'"
          :aria-pressed="level.status.value === 'on'"
          aria-label="水平儀"
          @click="toggleLevel"
        >
          <Ruler :size="20" aria-hidden="true" />
        </button>
        <button type="button" class="press grid size-11 place-items-center rounded-full bg-black/35 backdrop-blur" aria-label="切換前後鏡頭" @click="camera.flip()">
          <SwitchCamera :size="20" aria-hidden="true" />
        </button>
      </div>
    </div>

    <p
      v-if="level.status.value === 'denied' || level.status.value === 'unsupported'"
      class="absolute inset-x-4 rounded-xl bg-black/60 px-3 py-2 text-center text-sm"
      :style="{top: `${TOP + 8}px`}"
      role="status"
    >
      {{ level.status.value === 'denied' ? '沒有動作感測權限，水平儀沒辦法用。' : '這支手機的瀏覽器不支援水平儀。' }}
    </p>

    <!-- 相機還沒好：權限、錯誤 -->
    <div v-if="camera.status.value !== 'ready'" class="absolute inset-x-6 top-1/3 text-center" role="status">
      <template v-if="camera.status.value === 'starting' || camera.status.value === 'idle'">
        <LoaderCircle :size="28" class="mx-auto animate-spin motion-reduce:animate-none" aria-hidden="true" />
        <p class="mt-3 text-white/80">正在打開相機，請允許相機權限</p>
      </template>
      <template v-else>
        <p class="text-lg font-semibold">
          {{ camera.status.value === 'denied' ? '沒有相機權限' : camera.status.value === 'unsupported' ? '這個瀏覽器不能用相機' : '相機打不開' }}
        </p>
        <p class="mt-2 leading-relaxed text-white/75">
          <template v-if="camera.status.value === 'denied'">到 iPhone 的「設定 &gt; Safari &gt; 相機」改成「詢問」或「允許」，再按重試。</template>
          <template v-else-if="camera.status.value === 'unsupported'">請用 Safari 打開這個網頁。</template>
          <template v-else>可能有其他 App 正在用相機，關掉後再按重試。</template>
        </p>
        <button v-if="camera.status.value !== 'unsupported'" type="button" class="press mt-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-5 font-semibold text-black" @click="camera.start()">
          <RefreshCw :size="18" aria-hidden="true" />重試
        </button>
      </template>
    </div>

    <!-- 下方控制列 -->
    <div class="absolute inset-x-0 bottom-0 px-5" :style="{height: `${BOTTOM}px`, paddingBottom: 'env(safe-area-inset-bottom)'}">
      <label v-if="ghost.kind !== 'none'" class="mx-auto flex max-w-xs items-center gap-3 pt-4 text-sm">
        <span class="shrink-0 text-white/80">參考圖</span>
        <input v-model.number="opacity" type="range" min="0.1" max="0.9" step="0.05" class="w-full accent-[#f0b25a]" aria-label="參考圖透明度">
      </label>
      <div v-else class="h-10" />

      <div class="mx-auto mt-4 flex max-w-xs items-center justify-between">
        <button type="button" class="press flex w-16 flex-col items-center gap-1 text-xs" @click="pickerOpen = true">
          <span class="grid size-12 place-items-center rounded-full bg-white/15"><Layers :size="22" aria-hidden="true" /></span>
          參考圖
        </button>
        <button
          type="button"
          class="press grid size-[76px] place-items-center rounded-full border-4 border-white disabled:opacity-40"
          :disabled="camera.status.value !== 'ready'"
          aria-label="拍下這一張"
          @click="capture"
        >
          <span class="size-[60px] rounded-full bg-white" />
        </button>
        <button type="button" class="press flex w-16 flex-col items-center gap-1 text-xs" :aria-label="`格線：${GRID_LABEL[grid]}，點一下切換`" @click="cycleGrid">
          <span class="grid size-12 place-items-center rounded-full bg-white/15"><Grid3x3 :size="22" aria-hidden="true" /></span>
          {{ GRID_LABEL[grid] }}
        </button>
      </div>
      <p class="mt-3 text-center text-xs text-white/60">網頁相機畫質較低。要最好的畫質：對好位置後，用原生相機照同樣的構圖拍。</p>
    </div>

    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFile">

    <BottomSheet v-model:open="pickerOpen" title="參考圖">
      <div class="max-h-[60svh] overflow-y-auto pb-1">
        <div class="grid grid-cols-2 gap-2">
          <button type="button" class="press flex h-12 items-center justify-center gap-2 rounded-2xl border border-border font-semibold" @click="fileInput?.click()">
            <ImagePlus :size="20" aria-hidden="true" />用自己的照片
          </button>
          <button type="button" class="press flex h-12 items-center justify-center gap-2 rounded-2xl border border-border font-semibold" :class="{'bg-surface-strong': ghost.kind === 'none'}" @click="setGhost({kind: 'none'})">
            <X :size="20" aria-hidden="true" />不用參考圖
          </button>
        </div>
        <p class="mt-4 mb-2 text-sm text-muted">或疊一個姿勢</p>
        <ul class="grid grid-cols-3 gap-2">
          <li v-for="p in POSES" :key="p.id">
            <button
              type="button"
              class="press block w-full rounded-xl border p-1.5 text-left"
              :class="pose?.id === p.id ? 'border-accent bg-accent-soft' : 'border-border'"
              :aria-pressed="pose?.id === p.id"
              @click="setGhost({kind: 'pose', poseId: p.id})"
            >
              <span class="block aspect-[4/5] rounded-lg bg-bg p-1"><PoseFigure :pose="p" /></span>
              <span class="mt-1 block truncate px-0.5 text-xs">{{ p.title }}</span>
            </button>
          </li>
        </ul>
      </div>
    </BottomSheet>

    <!-- 拍完的照片 -->
    <div v-if="shot" class="absolute inset-0 z-10 flex flex-col bg-black" role="dialog" aria-label="拍好的照片">
      <img :src="shot.url" alt="剛拍的照片" class="min-h-0 flex-1 object-contain">
      <p v-if="saveError" class="px-5 pt-3 text-center text-sm text-[#f3c27d]" role="alert">{{ saveError }}</p>
      <div class="flex gap-3 px-5 pt-4" style="padding-bottom: max(env(safe-area-inset-bottom), 20px)">
        <button type="button" class="press h-13 flex-1 rounded-2xl bg-white/15 font-semibold" @click="discardShot">重拍</button>
        <button type="button" class="press flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-white font-semibold text-black" @click="saveShot">
          <Download :size="20" aria-hidden="true" />存到照片
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 疊在相機畫面上的人形：白線 + 淡陰影，什麼背景都看得清楚 */
.viewfinder-figure {
  --color-text: #ffffff;
  --color-accent: #b4c0ff;
  --color-muted: #ffffff;
  --color-surface-strong: rgb(255 255 255 / 0.18);
  --color-gold: #f0b25a;
  filter: drop-shadow(0 0 2px rgb(0 0 0 / 0.7));
}
</style>
