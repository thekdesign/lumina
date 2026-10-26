import type {LightPhase} from '@/lib/sun';

export const PHASE_LABEL: Record<LightPhase, string> = {
    night: '夜晚',
    blue: '藍調時刻',
    golden: '黃金時刻',
    day: '白天',
};

export const PERIOD_LABEL = {morning: '清晨', evening: '傍晚'} as const;

/** 「現在的光」：依目前階段給一句拍法 */
export const PHASE_ADVICE: Record<LightPhase, {title: string; body: string}> = {
    day: {
        title: '光線偏硬，找陰影拍人',
        body: '太陽高的時候臉上容易有黑眼窩。躲進騎樓、樹蔭或建築的陰面，面向亮的方向站，光會均勻很多；或讓太陽在側後方，當成頭髮的輪廓光。',
    },
    golden: {
        title: '最好拍的時候，把握時間',
        body: '光線低、暖、柔。讓太陽在被拍的人頭後方偏一側，髮絲會有金邊；點臉對焦後把曝光往上拉一點。想要立體感就改成側光。',
    },
    blue: {
        title: '天空最藍的十幾分鐘',
        body: '城市燈剛亮、天空還有顏色。讓人站在招牌或路燈旁邊補光，手機靠著欄杆或牆穩住，曝光往下拉一點，天空的藍才不會被拉白。',
    },
    night: {
        title: '找光源，不要找風景',
        body: '櫥窗、招牌、路燈都是現成的柔光燈。讓光從側前方照到臉上，背景的燈離越遠、光斑越大。開夜間模式時手機要穩住到快門結束。',
    },
};

export type LightTip = {
    id: string;
    title: string;
    /** 這種光長什麼樣 */
    character: string;
    /** 人和相機怎麼站 */
    how: string;
    /** 原生相機怎麼調 */
    camera: string;
};

/** 光線小抄：常見的光線情境 */
export const LIGHT_TIPS: LightTip[] = [
    {
        id: 'overcast',
        title: '陰天',
        character: '雲層像一整片大柔光罩，影子很淡，膚色均勻，其實是最好拍人像的天氣。',
        how: '少拍灰白的天空，找有顏色的背景，例如綠牆、花、彩色店面。',
        camera: '曝光往上拉 +0.3 到 +0.7，畫面會比較透亮。',
    },
    {
        id: 'noon',
        title: '正午大太陽',
        character: '頂光，眼窩和鼻子下面會有深色陰影，對比很強。',
        how: '躲進陰影區，或讓人背對太陽；帽沿、陽傘、樹蔭都能救。',
        camera: '點臉對焦；想保留藍天就把曝光往下拉，臉暗一點後製再拉回來。',
    },
    {
        id: 'window',
        title: '室內窗光',
        character: '從側面進來的窗光最有氛圍，明暗過渡柔和。',
        how: '人臉斜對窗戶約 45 度。背對窗會變黑臉，除非你想拍剪影。',
        camera: '點臉對焦，再把曝光往下拉，窗外才不會過曝成一片白。',
    },
    {
        id: 'backlight',
        title: '逆光',
        character: '太陽在被拍的人後面，頭髮和輪廓會發光，背景有夢幻的光暈。',
        how: '太陽放在頭後方偏一側；鏡頭眩光太強時，用手在鏡頭上方遮一下。',
        camera: '點臉對焦、曝光往上拉；想要剪影就反過來，點亮的天空、曝光往下拉。',
    },
    {
        id: 'shade',
        title: '樹蔭、騎樓',
        character: '開放式陰影：光很柔但偏冷，眼睛會有漂亮的眼神光。',
        how: '站在陰影的邊緣、臉朝外面亮的地方，不要整個人縮到最暗處。',
        camera: '照片偏藍的話，後製把色溫往暖調一點。',
    },
    {
        id: 'night',
        title: '夜景、城市燈',
        character: '光源是一點一點的，亮暗反差大，背景容易一片黑。',
        how: '讓臉靠近招牌、櫥窗這種大面積的光；背景的燈越遠，光斑越大。',
        camera: '人像模式讓背景燈變散景；夜間模式出現秒數時，手機要穩住到結束。',
    },
];
