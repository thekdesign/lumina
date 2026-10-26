import {createRouter, createWebHistory} from 'vue-router';
import AppShell from '@/layouts/AppShell.vue';
import LightPage from '@/pages/LightPage.vue';

// 底部 5 個分頁（docs/PROPOSAL.md §3）：光線是首頁，靜態載入；其他分頁 lazy load。
export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppShell,
            children: [
                {path: '', name: 'light', component: LightPage},
                {path: 'poses', name: 'poses', component: () => import('@/pages/PosesPage.vue')},
                {path: 'compose', name: 'compose', component: () => import('@/pages/ComposePage.vue')},
                {path: 'list', name: 'list', component: () => import('@/pages/ListPage.vue')},
                {path: 'coach', name: 'coach', component: () => import('@/pages/CoachPage.vue')},
            ],
        },
        // 對位取景器：全螢幕，不放在底部導覽的外殼裡
        {path: '/viewfinder', name: 'viewfinder', component: () => import('@/pages/ViewfinderPage.vue')},
        {path: '/:pathMatch(.*)*', redirect: '/'},
    ],
    scrollBehavior: () => ({top: 0}),
});
