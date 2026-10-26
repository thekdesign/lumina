// 對位取景器的純計算：畫面上的取景框對應到相機原始畫面的哪一塊，以及手機傾斜幾度。

export type Rect = {x: number; y: number; w: number; h: number};

/** 原生相機的直式照片是 3:4，取景框跟它一致，對好的構圖切過去才不會跑掉 */
export const FRAME_ASPECT = 3 / 4;

/** 在容器（螢幕）裡放一個最大的 aspect 比例框，水平置中、垂直稍微偏上（下方留給控制列） */
export function fitFrame(containerW: number, containerH: number, aspect = FRAME_ASPECT, bottomReserve = 0): Rect {
    const availH = containerH - bottomReserve;
    let w = containerW;
    let h = w / aspect;
    if (h > availH) {
        h = availH;
        w = h * aspect;
    }
    return {x: (containerW - w) / 2, y: Math.max((availH - h) / 2, 0), w, h};
}

/**
 * 影片用 object-fit: cover 鋪滿容器時，容器上的某個區域對應到影片原始畫素的哪一塊。
 * 拍照時就從影片裁這一塊，存下來的照片跟取景框看到的一模一樣。
 */
export function coverSourceRect(videoW: number, videoH: number, containerW: number, containerH: number, area: Rect): Rect {
    const scale = Math.max(containerW / videoW, containerH / videoH);
    const offsetX = (containerW - videoW * scale) / 2;
    const offsetY = (containerH - videoH * scale) / 2;
    return {
        x: (area.x - offsetX) / scale,
        y: (area.y - offsetY) / scale,
        w: area.w / scale,
        h: area.h / scale,
    };
}

/**
 * 直拿手機時左右歪了幾度（重力加速度算，0 = 水平，右邊低為正）。
 * 手機幾乎平放（往下拍桌面）時重力幾乎都在 z 軸，角度沒意義，回 undefined。
 */
export function rollDegrees(ax: number, ay: number, az: number): number | undefined {
    const planar = Math.hypot(ax, ay);
    if (planar < Math.abs(az) * 0.35) {
        return undefined;
    }
    return Math.atan2(ax, -ay) * 180 / Math.PI;
}
