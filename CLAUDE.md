# Lumina 拾光 — 給 Claude 的專案指引

接手前先讀 [docs/PROPOSAL.md](./docs/PROPOSAL.md)（定案企劃與分級）。

## 硬規則

- **不自己做相機**：拍照一律交給 iPhone 原生相機。MVP（P0）完全不碰 getUserMedia；對位取景器（③）是 P1，做之前要先實機驗證 iOS 主畫面 App 的相機 bug。
- **純前端、無後端、離線可用**：內容打包在 JS 裡，資料只存本機（localStorage / IndexedDB）。不接任何追蹤 / analytics SDK。
- **位置只存在手機**：GPS 座標取到小數點後兩位就存，不上傳、不反查地址。
- **suncalc 2.x 的角度單位是「度」**，不是弧度；到不了的高度角回 `null`。
- **push＝上線**：建 GitHub repo、push、接 Vercel 之前先問 Kevin。

## 設計

- 冷調銀鹽相紙灰白 + 藍調墨色 `#1d1b33`；黃金時刻琥珀 `--color-gold` 只當裝飾色，文字用 `--color-gold-ink`。
- 拉丁字與時間數字用 Bodoni Moda（`font-display` / `numerals` utility），中文用系統蘋方。
- 首頁的天空色帶是唯一的「大膽元素」，其他地方保持安靜；動畫 150–300ms ease-out、尊重 `prefers-reduced-motion`。

## 慣例

- 排版規則同 haplo / kairo / selene：ESLint + @stylistic（.ts 4 空格、.vue 2 空格、分號、單引號、`{mask}` 不加空格、if 一律帶大括號）。
- 空值用 `undefined` 不用 `null`。
- commit 作者 `thekdesign <30178778+thekdesign@users.noreply.github.com>`（已設在本 repo 的 git config），訊息英文、按 concern 拆。
- 純邏輯放 `src/lib/*.ts` 並配 `*.test.ts`；文案內容放 `src/content/`。

## 驗證流程

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

視覺驗證：`npx vite --port 8090` 後用 playwright-core（`channel: 'msedge'`）截圖，腳本與截圖放 `temp/`（gitignored）。
可用 `page.clock.setFixedTime()` 模擬黃金時刻 / 夜晚，`localStorage['lumina:place']` 預先放地點略過定位。
