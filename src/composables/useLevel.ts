import {onBeforeUnmount, ref} from 'vue';
import {rollDegrees} from '@/lib/viewfinder';

// 水平儀：讀重力加速度算左右傾斜。iOS 13 起要在使用者點擊時呼叫 requestPermission 才拿得到感測器。

type MotionPermission = {requestPermission?: () => Promise<'granted' | 'denied'>};

export function useLevel() {
    const status = ref<'off' | 'on' | 'denied' | 'unsupported'>('off');
    const angle = ref<number>();
    // 低通濾波，數字才不會一直抖
    let g = {x: 0, y: -9.8, z: 0};

    function onMotion(e: DeviceMotionEvent) {
        const a = e.accelerationIncludingGravity;
        if (a?.x == null || a.y == null || a.z == null) {
            return;
        }
        g = {x: g.x * 0.8 + a.x * 0.2, y: g.y * 0.8 + a.y * 0.2, z: g.z * 0.8 + a.z * 0.2};
        angle.value = rollDegrees(g.x, g.y, g.z);
    }

    /** 要在點擊事件裡呼叫 */
    async function enable() {
        if (typeof DeviceMotionEvent === 'undefined') {
            status.value = 'unsupported';
            return;
        }
        const ask = (DeviceMotionEvent as unknown as MotionPermission).requestPermission;
        if (ask) {
            try {
                if (await ask() !== 'granted') {
                    status.value = 'denied';
                    return;
                }
            } catch {
                status.value = 'denied';
                return;
            }
        }
        window.addEventListener('devicemotion', onMotion);
        status.value = 'on';
    }

    function disable() {
        window.removeEventListener('devicemotion', onMotion);
        angle.value = undefined;
        status.value = 'off';
    }

    onBeforeUnmount(disable);

    return {status, angle, enable, disable};
}
