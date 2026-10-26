import {createApp} from 'vue';
import './style.css';
import App from './App.vue';
import {router} from '@/router';

// iOS Safari 的老坑：沒有任何 touchstart 監聽器時 :active 常常不觸發，.press 按壓回饋會失效。
document.addEventListener('touchstart', () => {}, {passive: true});

// 部署新版後，舊頁面要載入的分頁 chunk 可能已經不存在：重新整理一次拿新版（只試一次，避免無限重整）
router.onError((err, to) => {
    const chunkFailed = /Failed to fetch dynamically imported module|Importing a module script failed/i.test(String(err?.message));
    if (chunkFailed && !sessionStorage.getItem('lumina:reloaded')) {
        sessionStorage.setItem('lumina:reloaded', '1');
        window.location.assign(to.fullPath);
    }
});

createApp(App).use(router).mount('#app');

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // PWA：註冊 service worker（僅正式環境，避免 dev 熱更新被快取干擾）
        navigator.serviceWorker.register('/sw.js').catch((err) => {
            console.error('SW 註冊失敗：', err);
        });
        // 有空時先把其他分頁的程式載下來，service worker 會順手快取，第一次開完就整個 App 都能離線用
        const prefetch = () => {
            for (const route of router.getRoutes()) {
                const component = route.components?.default;
                if (typeof component === 'function') {
                    void (component as () => Promise<unknown>)();
                }
            }
        };
        if ('requestIdleCallback' in window) {
            requestIdleCallback(prefetch);
        } else {
            setTimeout(prefetch, 2000);
        }
    });
}
