<script setup lang="ts">
import {ArrowLeft} from '@lucide/vue';
import {onBeforeUnmount, onMounted, reactive, ref, watch} from 'vue';
import {POSES} from '@/content/poses';
import {CARD_HEIGHT, CARD_WIDTH, drawPoseCard} from '@/lib/poseCard';

// 實驗頁：能不能把姿勢參考卡用子母畫面（PiP）浮在 iPhone 原生相機上？
// 方法 1：canvas.captureStream() 即時串流 → <video> → PiP
// 方法 2：把同一張卡用 MediaRecorder 錄成短影片 → 一般影片檔 → PiP（iOS 對一般影片的 PiP 支援通常比較穩）
// 結果還沒經過實機驗證，頁面上會列出診斷資訊與事件紀錄，方便回報。

type WebkitVideo = HTMLVideoElement & {
  webkitSupportsPresentationMode?: (mode: string) => boolean;
  webkitSetPresentationMode?: (mode: string) => void;
  webkitPresentationMode?: string;
};
type StreamCanvas = HTMLCanvasElement & {captureStream?: (fps?: number) => MediaStream};

const canvas = ref<StreamCanvas>();
const video = ref<WebkitVideo>();
const poseId = ref(POSES[0].id);
const mode = ref<'stream' | 'recorded'>('stream');
const recording = ref(false);
const log = ref<string[]>([]);

const diag = reactive({
  standalone: false,
  pipApi: false,
  webkitPip: false,
  captureStream: false,
  recorder: '',
});

function note(msg: string) {
  const t = new Date().toLocaleTimeString('zh-TW', {hour12: false});
  log.value = [`${t} ${msg}`, ...log.value].slice(0, 30);
}

function draw() {
  const ctx = canvas.value?.getContext('2d');
  const pose = POSES.find((p) => p.id === poseId.value);
  if (ctx && pose) {
    drawPoseCard(ctx, pose);
  }
}

// captureStream 只在畫布有變動時才出新的畫格，定期重畫讓串流不斷
let redraw: ReturnType<typeof setInterval> | undefined;

async function useStream() {
  const c = canvas.value;
  const v = video.value;
  if (!c?.captureStream || !v) {
    note('這個瀏覽器沒有 canvas.captureStream，方法 1 無法使用');
    return;
  }
  v.removeAttribute('src');
  v.srcObject = c.captureStream(15);
  mode.value = 'stream';
  try {
    await v.play();
    note('方法 1：串流已在預覽播放');
  } catch (err) {
    note(`方法 1：播放失敗：${(err as Error).message}`);
  }
}

function pickMime(): string | undefined {
  if (typeof MediaRecorder === 'undefined') {
    return undefined;
  }
  return ['video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m));
}

async function record() {
  const c = canvas.value;
  const v = video.value;
  const mimeType = pickMime();
  if (!c?.captureStream || !v || !mimeType) {
    note('不能錄影（沒有 captureStream 或 MediaRecorder），方法 2 無法使用');
    return;
  }
  recording.value = true;
  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(c.captureStream(30), {mimeType});
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const stopped = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });
  recorder.start();
  await new Promise((r) => setTimeout(r, 1500));
  recorder.stop();
  await stopped;
  recording.value = false;

  const url = URL.createObjectURL(new Blob(chunks, {type: mimeType}));
  v.srcObject = null;
  v.src = url;
  v.loop = true;
  mode.value = 'recorded';
  try {
    await v.play();
    note(`方法 2：已錄成 ${mimeType} 影片（${Math.round(chunks.reduce((n, b) => n + b.size, 0) / 1024)} KB）`);
  } catch (err) {
    note(`方法 2：影片播放失敗：${(err as Error).message}`);
  }
}

// 一定要在點擊的當下呼叫（不能先 await 別的事），Safari 才會認為是使用者觸發
function enterPip() {
  const v = video.value;
  if (!v) {
    return;
  }
  if (document.pictureInPictureEnabled && v.requestPictureInPicture) {
    v.requestPictureInPicture().then(
      () => note('已進入子母畫面（標準 API）'),
      (err: Error) => note(`進入子母畫面失敗（標準 API）：${err.name} ${err.message}`),
    );
  } else if (v.webkitSupportsPresentationMode?.('picture-in-picture')) {
    v.webkitSetPresentationMode?.('picture-in-picture');
    note('已要求進入子母畫面（webkit API）');
  } else {
    note('這個瀏覽器不支援子母畫面');
  }
}

watch(poseId, () => {
  draw();
  if (mode.value === 'recorded') {
    note('換了姿勢：改回方法 1，要用方法 2 請重新錄影');
    void useStream();
  }
});

onMounted(() => {
  draw();
  redraw = setInterval(draw, 250);
  const v = video.value!;
  const c = canvas.value!;
  diag.standalone = matchMedia('(display-mode: standalone)').matches;
  diag.pipApi = document.pictureInPictureEnabled === true;
  diag.webkitPip = v.webkitSupportsPresentationMode?.('picture-in-picture') === true;
  diag.captureStream = typeof c.captureStream === 'function';
  diag.recorder = pickMime() ?? '';
  v.addEventListener('enterpictureinpicture', () => note('事件：進入子母畫面'));
  v.addEventListener('leavepictureinpicture', () => note('事件：離開子母畫面'));
  v.addEventListener('webkitpresentationmodechanged', () => note(`事件：顯示模式 → ${v.webkitPresentationMode}`));
  v.addEventListener('pause', () => note('事件：影片暫停'));
  document.addEventListener('visibilitychange', () => note(`事件：頁面${document.hidden ? '到背景' : '回到前景'}`));
  void useStream();
});

onBeforeUnmount(() => clearInterval(redraw));

const DIAG_ROWS = [
  {key: 'standalone', label: '從主畫面開啟'},
  {key: 'pipApi', label: '標準子母畫面 API'},
  {key: 'webkitPip', label: 'webkit 子母畫面 API'},
  {key: 'captureStream', label: '畫布轉串流'},
] as const;
</script>

<template>
  <main class="mx-auto min-h-svh max-w-md px-4 pb-16" style="padding-top: max(env(safe-area-inset-top), 12px)">
    <router-link :to="{name: 'coach'}" class="inline-flex h-10 items-center gap-1 text-accent-ink">
      <ArrowLeft :size="18" aria-hidden="true" />教練
    </router-link>
    <h1 class="mt-2 text-[28px] font-bold">浮動參考卡（實驗）</h1>
    <p class="mt-1 leading-relaxed text-muted">
      測試能不能把姿勢卡用子母畫面浮在 iPhone 原生相機上。還沒在實機驗證過，請照下面步驟試，再把結果告訴我。
    </p>

    <label class="mt-5 block">
      <span class="text-sm text-muted">選一個姿勢</span>
      <select v-model="poseId" class="mt-1 h-12 w-full rounded-2xl border border-border bg-surface px-3">
        <option v-for="p in POSES" :key="p.id" :value="p.id">{{ p.title }}</option>
      </select>
    </label>

    <div class="mt-4 overflow-hidden rounded-2xl">
      <video
        ref="video"
        class="block aspect-[3/4] w-full bg-ground"
        muted
        playsinline
        autoplay
        autopictureinpicture
        aria-label="參考卡預覽"
      />
    </div>
    <canvas ref="canvas" :width="CARD_WIDTH" :height="CARD_HEIGHT" class="hidden" />

    <div class="mt-4 grid grid-cols-2 gap-2">
      <button type="button" class="press h-12 rounded-2xl border border-border font-semibold" :class="{'bg-surface-strong': mode === 'stream'}" @click="useStream">
        方法 1：即時串流
      </button>
      <button type="button" class="press h-12 rounded-2xl border border-border font-semibold disabled:opacity-50" :class="{'bg-surface-strong': mode === 'recorded'}" :disabled="recording" @click="record">
        {{ recording ? '錄影中…' : '方法 2：錄成影片' }}
      </button>
    </div>
    <button type="button" class="press mt-2 h-13 w-full rounded-2xl bg-accent font-semibold text-on-accent" @click="enterPip">
      開始浮動（{{ mode === 'stream' ? '方法 1' : '方法 2' }}）
    </button>

    <section class="card mt-5 p-5">
      <h2 class="font-bold">測試步驟</h2>
      <ol class="mt-2 list-decimal space-y-1.5 pl-5 leading-relaxed">
        <li>按「開始浮動」，看有沒有出現浮動小視窗</li>
        <li>回主畫面打開「相機」，看小視窗還在不在、會不會被蓋掉</li>
        <li>回來切成「方法 2：錄成影片」，再試一次</li>
        <li>用 Safari 和「加入主畫面」後的版本各試一次</li>
        <li>截圖這頁下方的診斷和事件紀錄給我</li>
      </ol>
    </section>

    <section class="card mt-3 p-5">
      <h2 class="font-bold">診斷</h2>
      <dl class="mt-2 space-y-1 text-sm">
        <div v-for="row in DIAG_ROWS" :key="row.key" class="flex justify-between">
          <dt class="text-muted">{{ row.label }}</dt>
          <dd>{{ diag[row.key] ? '有' : '沒有' }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-muted">錄影格式</dt>
          <dd>{{ diag.recorder || '不能錄影' }}</dd>
        </div>
      </dl>
    </section>

    <section class="card mt-3 p-5">
      <h2 class="font-bold">事件紀錄</h2>
      <p v-if="!log.length" class="mt-2 text-sm text-muted">還沒有事件。</p>
      <ol v-else class="mt-2 space-y-1 text-sm">
        <li v-for="(line, i) in log" :key="i">{{ line }}</li>
      </ol>
    </section>
  </main>
</template>
