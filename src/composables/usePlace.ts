import {ref} from 'vue';
import type {Place} from '@/content/places';
import {deviceTimeZone} from '@/lib/zone';

// 模組級單例：目前用哪個地點算日照。存在 localStorage，下次開 App（或離線）直接用上次的地點，
// 不會每次都跳定位授權（iOS 主畫面 App 的定位授權常常每次都重問，自動重抓會很煩）。
const STORAGE_KEY = 'lumina:place';

export type LocateStatus = 'idle' | 'locating' | 'denied' | 'unavailable';

function load(): Place | undefined {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return undefined;
        }
        const p = JSON.parse(raw) as Place;
        return Number.isFinite(p.lat) && Number.isFinite(p.lng) && p.timeZone ? p : undefined;
    } catch {
        return undefined;
    }
}

const place = ref<Place | undefined>(load());
const status = ref<LocateStatus>('idle');

function choose(p: Place) {
    place.value = p;
    status.value = 'idle';
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
        // 無痕模式等情況寫不進去，這次照用、下次重選
    }
}

/** 用 GPS 抓目前位置；成功回 true */
function locate(): Promise<boolean> {
    if (!('geolocation' in navigator)) {
        status.value = 'unavailable';
        return Promise.resolve(false);
    }
    status.value = 'locating';
    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                choose({
                    name: '目前位置',
                    // 小數點後兩位（約 1 公里）就夠算日照，也不留精確位置
                    lat: Math.round(pos.coords.latitude * 100) / 100,
                    lng: Math.round(pos.coords.longitude * 100) / 100,
                    timeZone: deviceTimeZone(),
                    source: 'gps',
                });
                resolve(true);
            },
            (err) => {
                status.value = err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable';
                resolve(false);
            },
            {enableHighAccuracy: false, timeout: 15000, maximumAge: 30 * 60 * 1000},
        );
    });
}

export function usePlace() {
    return {place, status, choose, locate};
}
