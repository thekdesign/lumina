import {createStore, get, set} from 'idb-keyval';
import {computed, ref, toRaw} from 'vue';
import {POSES} from '@/content/poses';
import {moveItem, sanitizeFavorites, sanitizeItems, type ShotItem} from '@/lib/shotList';

// 模組級單例：收藏的姿勢 + 拍攝清單，存在 IndexedDB（只在這支手機，離線可用）。
// 無痕模式等情況 IndexedDB 打不開時，照常在記憶體裡運作，畫面上提示「關掉 App 後不會保留」。
const store = createStore('lumina', 'kv');
const KNOWN_POSES = new Set(POSES.map((p) => p.id));

const items = ref<ShotItem[]>([]);
const favorites = ref<string[]>([]);
const status = ref<'loading' | 'ready' | 'memory-only'>('loading');

let loading: Promise<void> | undefined;

function load() {
    loading ??= (async () => {
        try {
            const [rawItems, rawFavorites] = await Promise.all([get('shotList', store), get('favorites', store)]);
            items.value = sanitizeItems(rawItems, KNOWN_POSES);
            favorites.value = sanitizeFavorites(rawFavorites, KNOWN_POSES);
            status.value = 'ready';
        } catch (err) {
            console.error('[shotList] 讀取失敗，改用記憶體：', err);
            status.value = 'memory-only';
        }
    })();
    return loading;
}

async function persist() {
    if (status.value !== 'ready') {
        return;
    }
    try {
        // IndexedDB 存不了 Vue 的 Proxy，先轉回一般物件
        await Promise.all([
            set('shotList', toRaw(items.value).map((i) => ({...i})), store),
            set('favorites', [...toRaw(favorites.value)], store),
        ]);
    } catch (err) {
        console.error('[shotList] 寫入失敗：', err);
        status.value = 'memory-only';
    }
}

function newId(): string {
    return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useShotList() {
    void load();

    const doneCount = computed(() => items.value.filter((i) => i.done).length);

    function addPose(poseId: string) {
        items.value = [...items.value, {id: newId(), poseId, done: false}];
        void persist();
    }

    function addNote(note: string) {
        const text = note.trim();
        if (!text) {
            return;
        }
        items.value = [...items.value, {id: newId(), note: text, done: false}];
        void persist();
    }

    function toggleDone(id: string) {
        items.value = items.value.map((i) => i.id === id ? {...i, done: !i.done} : i);
        void persist();
    }

    function remove(id: string) {
        items.value = items.value.filter((i) => i.id !== id);
        void persist();
    }

    function move(id: string, delta: -1 | 1) {
        items.value = moveItem(items.value, items.value.findIndex((i) => i.id === id), delta);
        void persist();
    }

    function resetDone() {
        items.value = items.value.map((i) => ({...i, done: false}));
        void persist();
    }

    function clearAll() {
        items.value = [];
        void persist();
    }

    function isFavorite(poseId: string) {
        return favorites.value.includes(poseId);
    }

    function toggleFavorite(poseId: string) {
        favorites.value = isFavorite(poseId)
            ? favorites.value.filter((id) => id !== poseId)
            : [...favorites.value, poseId];
        void persist();
    }

    function countInList(poseId: string) {
        return items.value.filter((i) => i.poseId === poseId).length;
    }

    return {
        items, favorites, status, doneCount,
        addPose, addNote, toggleDone, remove, move, resetDone, clearAll,
        isFavorite, toggleFavorite, countInList,
    };
}
