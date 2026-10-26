# Lumina 拾光

用 iPhone 原生相機拍出好照片的輔助 PWA。拍照交給原生相機，Lumina 負責拍前找光、選姿勢與構圖、整理拍攝清單。

- **光線**：依所在位置算出今天的黃金時刻、藍調時刻與倒數，附光線小抄
- **姿勢**：22 個姿勢，附被拍者口令、鏡頭高度與倍率
- **構圖**：7 種構圖法的示意圖與原生相機操作
- **清單**：收藏姿勢、排拍攝順序、現場勾選
- **教練**：iPhone 相機設定健檢與情境速查

純前端、無後端，資料只存在手機，開過一次後可離線使用。企劃見 [docs/PROPOSAL.md](./docs/PROPOSAL.md)。

## 開發

```bash
npm install
npm run dev            # 開發伺服器
npm run lint && npm run typecheck && npm test && npm run build
npm run icons          # 改了 public/favicon.svg 或 scripts/icons/*.svg 後重產 PNG 圖示（需要 Edge）
```

技術棧：Vue 3 + Vite + Tailwind CSS 4，日照計算用 [suncalc](https://github.com/mourner/suncalc)，收藏與清單存 IndexedDB（idb-keyval），service worker 為手寫。
