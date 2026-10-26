<script setup lang="ts">
import {useTheme} from '@/composables/useTheme';

// 啟動主題單例（同步 theme-color）
useTheme();
</script>

<template>
  <router-view />
</template>
