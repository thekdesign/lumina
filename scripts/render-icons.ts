// 把 SVG logo 輸出成 PWA 需要的 PNG（manifest icons + apple-touch-icon）。
// 改了 public/favicon.svg 或 scripts/icons/*.svg 之後跑 `npm run icons` 重新產生。
// 用系統的 Edge 渲染（playwright-core 不自帶瀏覽器）；沒裝 Edge 就把 channel 改成 'chrome'。
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright-core';

const root = path.resolve(import.meta.dirname, '..');

const targets = [
    {src: 'public/favicon.svg', out: 'public/pwa-192.png', size: 192},
    {src: 'public/favicon.svg', out: 'public/pwa-512.png', size: 512},
    // maskable：底色滿版、內容縮進 80% 安全區，系統裁成圓形 / 圓角都不會切到圖
    {src: 'scripts/icons/maskable.svg', out: 'public/pwa-maskable-512.png', size: 512},
    // iOS 會自己套圓角，所以用滿版底色、不要透明角
    {src: 'scripts/icons/apple-touch.svg', out: 'public/apple-touch-icon.png', size: 180},
];

const browser = await chromium.launch({channel: 'msedge'});
try {
    for (const t of targets) {
        const svg = readFileSync(path.join(root, t.src), 'utf8');
        const page = await browser.newPage({viewport: {width: t.size, height: t.size}});
        await page.setContent(
            '<html><body style="margin:0;background:transparent">'
            + `<div style="width:${t.size}px;height:${t.size}px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div>`
            + '</body></html>',
        );
        await page.screenshot({path: path.join(root, t.out), omitBackground: true});
        await page.close();
        console.log(`✓ ${t.out}`);
    }
} finally {
    await browser.close();
}
