import {onBeforeUnmount, ref, type Ref} from 'vue';

// 網頁相機（getUserMedia）。只用在對位取景器：畫質比原生相機低，定位是「對位工具」。
// iOS 切到背景時會停掉相機，回到前景要重開；離開頁面一定要關掉，不然相機指示燈會一直亮。

export type CameraStatus = 'idle' | 'starting' | 'ready' | 'denied' | 'unavailable' | 'unsupported';
export type Facing = 'environment' | 'user';

export function useCamera(video: Ref<HTMLVideoElement | undefined>) {
    const status = ref<CameraStatus>('idle');
    const facing = ref<Facing>('environment');
    let stream: MediaStream | undefined;

    function stop() {
        stream?.getTracks().forEach((t) => t.stop());
        stream = undefined;
        if (video.value) {
            video.value.srcObject = null;
        }
    }

    async function start() {
        if (!navigator.mediaDevices?.getUserMedia) {
            status.value = 'unsupported';
            return;
        }
        stop();
        status.value = 'starting';
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {facingMode: facing.value, width: {ideal: 1920}, height: {ideal: 1920}},
            });
            if (video.value) {
                video.value.srcObject = stream;
                await video.value.play();
            }
            status.value = 'ready';
        } catch (err) {
            const name = (err as DOMException).name;
            status.value = name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable';
            console.error('[camera]', err);
        }
    }

    function flip() {
        facing.value = facing.value === 'environment' ? 'user' : 'environment';
        void start();
    }

    function onVisibility() {
        if (document.hidden) {
            stop();
            status.value = 'idle';
        } else {
            void start();
        }
    }
    document.addEventListener('visibilitychange', onVisibility);

    onBeforeUnmount(() => {
        document.removeEventListener('visibilitychange', onVisibility);
        stop();
    });

    return {status, facing, start, stop, flip};
}
