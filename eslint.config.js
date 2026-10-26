import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// 分工：ESLint（js/ts/vue 推薦規則）抓「邏輯／品質」問題；
// @stylistic 只管「排版」，且只鎖定我們在意的四項，依副檔名分風格：
//   .ts → 4 空格、.vue → 2 空格；一律分號、單引號、物件大括號不加空格（{mask} 非 { mask }）。
// 不啟用 import 排序、template 換行、arrow-parens 等額外意見，避免無謂 churn。
// 慣例來源：kairo / haplo / selene（同一開發者的其他專案），沿用同一套規則減少切換成本。
export default tseslint.config(
    {
        ignores: [
            'dist',
            'dev-dist',
            'node_modules',
            'public', // 靜態資產（service worker 等），不該被重排
        ],
    },

    // ===== 邏輯 / 品質 =====
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/essential'],

    {
        rules: {
            'no-undef': 'off',
            'vue/multi-word-component-names': 'off',
        },
    },

    // .vue 的 <script lang="ts"> 交給 ts 解析器
    {
        files: ['**/*.vue'],
        languageOptions: {
            parserOptions: {parser: tseslint.parser},
        },
    },

    // 執行環境 globals
    {
        files: ['**/*.{ts,vue}'],
        languageOptions: {globals: {...globals.browser}},
    },
    {
        files: ['**/*.test.ts'],
        languageOptions: {globals: {...globals.node}},
    },

    // ===== 排版（@stylistic）：只鎖四項 =====
    {
        plugins: {style: stylistic},
        rules: {
            'style/semi': ['error', 'always'],
            'style/quotes': ['error', 'single', {avoidEscape: true}],
            'style/object-curly-spacing': ['error', 'never'],
            'style/indent': ['error', 4],
            'curly': ['error', 'all'],
            'style/brace-style': ['error', '1tbs', {allowSingleLine: true}],
        },
    },

    // .vue → 2 空格
    {
        files: ['**/*.vue'],
        rules: {
            'style/indent': 'off',
            'vue/html-indent': ['error', 2],
            'vue/script-indent': ['error', 2, {baseIndent: 0, switchCase: 1}],
        },
    },
);
