import {createApp} from 'vue';
import './style.css';
import App from './App.vue';
import {router} from '@/router';

// iOS Safari 的老坑：沒有任何 touchstart 監聽器時 :active 常常不觸發，.press 按壓回饋會失效。
document.addEventListener('touchstart', () => {}, {passive: true});

createApp(App).use(router).mount('#app');

// PWA：註冊 service worker（僅正式環境，避免 dev 熱更新被快取干擾）。
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
            console.error('SW 註冊失敗：', err);
        });
    });
}
