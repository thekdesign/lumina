import {defineConfig} from 'vitest/config';
import path from 'node:path';

// 純函式單元測試（src/lib 的日照、時區等計算）。刻意不套 vue/tailwind 外掛：
// 這些測試不碰元件，保持 node 環境最輕最快。只需 '@' alias 讓測試檔用同一組 import。
export default defineConfig({
    resolve: {
        alias: {'@': path.resolve(import.meta.dirname, './src')},
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
    },
});
