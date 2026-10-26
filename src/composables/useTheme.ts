import {computed, watch} from 'vue';
import {useColorMode} from '@vueuse/core';

// 模組級單例：跨元件共享同一份主題狀態。
// useColorMode 負責 localStorage 持久化（key 'vueuse-color-scheme'）+ 套用 html 的 .dark class。
// 它本身的值是「實際套用的結果」（light / dark），使用者的選擇（含 auto）在 .store。
const mode = useColorMode({
    attribute: 'class',
    modes: {light: '', dark: 'dark'},
});

const isDark = computed(() => mode.value === 'dark');

// 手機狀態列顏色隨主題（色值與 style.css 的 --color-bg、index.html 的防閃爍 script 一致）
watch(
    isDark,
    (dark) => {
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#12132a' : '#f2f3f6');
    },
    {immediate: true},
);

export function useTheme() {
    return {preference: mode.store, isDark};
}
