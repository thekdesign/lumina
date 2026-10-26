// 姿勢示意圖的線條人形：每個人是一組關節座標，畫成圓頭 + 圓角線段。
// 座標系：viewBox 120 × 150，地面 y = 140，單人站在 x = 60。
// 先在「站中間、原始大小」的座標裡擺好姿勢，再用 dx / dy / scale 搬到畫面上，
// 這樣雙人照只要各自往左右推，牽手的手就能算準在中間碰到。

export type Joint = readonly [number, number];

export type Body = {
    head: Joint;
    neck: Joint;
    sL: Joint; // 左肩（畫面左側）
    eL: Joint; // 左手肘
    hL: Joint; // 左手
    sR: Joint;
    eR: Joint;
    hR: Joint;
    pelvis: Joint;
    kL: Joint; // 左膝
    fL: Joint; // 左腳
    kR: Joint;
    fR: Joint;
};

export type Tone = 'main' | 'partner';

export type Person = {
    body: Body;
    tone: Tone;
    dx: number;
    dy: number;
    scale: number;
};

export const GROUND_Y = 140;
const CENTER_X = 60;
const HEAD_R = 8;

export const STANDING: Body = {
    head: [60, 20],
    neck: [60, 31],
    sL: [50, 35],
    eL: [47, 55],
    hL: [46, 73],
    sR: [70, 35],
    eR: [73, 55],
    hR: [74, 73],
    pelvis: [60, 76],
    kL: [56, 107],
    fL: [55, 140],
    kR: [64, 107],
    fR: [65, 140],
};

/** 從站姿出發改幾個關節，再決定放在畫面哪裡 */
export function person(
    overrides: Partial<Body> = {},
    {dx = 0, dy = 0, scale = 1, tone = 'main'}: {dx?: number; dy?: number; scale?: number; tone?: Tone} = {},
): Person {
    return {body: {...STANDING, ...overrides}, tone, dx, dy, scale};
}

/** 把「原始座標」搬到畫面上：以腳底中心為基準縮放，再平移 */
export function place(p: Person, [x, y]: Joint): Joint {
    return [
        round(CENTER_X + (x - CENTER_X) * p.scale + p.dx),
        round(GROUND_Y - (GROUND_Y - y) * p.scale + p.dy),
    ];
}

function round(n: number): number {
    return Math.round(n * 10) / 10;
}

function polyline(points: Joint[]): string {
    return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
}

/**
 * 一個人要畫的東西：頭（圓）+ 四肢軀幹（線段）。
 * 半身照（legs: false）不畫腿，軀幹直接延伸出畫面下緣，看起來才像「鏡頭只拍到這裡」。
 */
export function personShapes(p: Person, {legs = true} = {}): {head: {cx: number; cy: number; r: number}; paths: string[]; stroke: number} {
    const b = p.body;
    const at = (j: Joint) => place(p, j);
    const [cx, cy] = at(b.head);
    const torsoEnd: Joint = legs ? b.pelvis : [b.pelvis[0], GROUND_Y];
    return {
        head: {cx, cy, r: round(HEAD_R * p.scale)},
        paths: [
            polyline([at(b.neck), at(torsoEnd)]),
            polyline([at(b.hL), at(b.eL), at(b.sL), at(b.neck), at(b.sR), at(b.eR), at(b.hR)]),
            ...(legs ? [polyline([at(b.fL), at(b.kL), at(b.pelvis), at(b.kR), at(b.fR)])] : []),
        ],
        // 縮小的人（遠景）線條跟著變細，但不細到看不見
        stroke: round(Math.max(3.2 * p.scale, 1.6)),
    };
}

export type CameraHeight = 'high' | 'eye' | 'chest' | 'waist' | 'low';

/**
 * 相機高度在畫面上的 y：依主角（第一個人）這個姿勢實際的關節位置算，
 * 坐著的人「胸口高度」自然就比站著的低。
 */
export function cameraY(main: Person, height: CameraHeight): number {
    const b = main.body;
    const y = {
        high: b.head[1] - 18,
        eye: b.head[1],
        chest: b.neck[1] + (b.pelvis[1] - b.neck[1]) * 0.3,
        waist: b.pelvis[1],
        // 蹲低是相對地面（跳起來的人膝蓋在半空中，鏡頭還是在地上）
        low: GROUND_Y - 28,
    }[height];
    return Math.max(place(main, [CENTER_X, y])[1], 2);
}
