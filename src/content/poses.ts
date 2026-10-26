import {person, type CameraHeight, type Person} from '@/lib/figure';

export type PoseCategory = 'solo' | 'sitting' | 'cafe' | 'couple' | 'friends' | 'selfie' | 'travel';

export const CATEGORY_LABEL: Record<PoseCategory, string> = {
    solo: '單人',
    sitting: '坐姿',
    cafe: '咖啡廳',
    couple: '情侶',
    friends: '朋友',
    selfie: '自拍',
    travel: '旅行',
};

/** 取景範圍：決定示意圖要看全身、上半身，還是人很小的遠景 */
export type Framing = 'full' | 'half' | 'wide';

export const FRAMING_LABEL: Record<Framing, string> = {
    full: '全身',
    half: '半身',
    wide: '遠景',
};

export const CAMERA_HEIGHT_LABEL: Record<CameraHeight, string> = {
    high: '舉高往下拍',
    eye: '跟眼睛同高',
    chest: '胸口高度',
    waist: '腰的高度',
    low: '蹲低到膝蓋',
};

export type Zoom = '0.5x' | '1x' | '2x' | '3x';

/** 場景道具：line＝場景線條、fill＝淡色塊（山、窗、地標）、object＝手上的小東西（杯子、手機）、guide＝構圖參考線（虛線） */
export type Prop = {d: string; kind: 'line' | 'fill' | 'object' | 'guide'};

export type Pose = {
    id: string;
    title: string;
    category: PoseCategory;
    framing: Framing;
    /** 跟被拍的人說的話（口令） */
    cues: string[];
    camera: {height: CameraHeight; zoom: Zoom; tip: string};
    people: Person[];
    props?: Prop[];
};

const GROUND: Prop = {d: 'M6 140 H114', kind: 'line'};

export const POSES: Pose[] = [
    // ===== 單人 =====
    {
        id: 'walk-look-back',
        title: '走路回頭看',
        category: 'solo',
        framing: 'full',
        cues: ['往前慢慢走，不用看鏡頭', '聽到「好」的時候回頭看我', '回頭時肩膀不要跟著轉，只轉頭'],
        camera: {height: 'waist', zoom: '1x', tip: '開連拍（按住快門往左滑），從回頭前一秒拍到回頭後，挑最自然的一張。'},
        people: [person({
            head: [62, 20],
            eL: [45, 54], hL: [41, 71],
            eR: [74, 53], hR: [79, 69],
            kL: [54, 106], fL: [46, 139],
            kR: [66, 107], fR: [70, 140],
        })],
        props: [GROUND],
    },
    {
        id: 'weight-back',
        title: '重心放後腳',
        category: 'solo',
        framing: 'full',
        cues: ['重心放在後面那隻腳', '前腳膝蓋放鬆、微微彎', '一隻手插口袋，另一隻自然垂下'],
        camera: {height: 'waist', zoom: '1x', tip: '從腰的高度拍，腿會顯長；人放在畫面中間偏下，頭頂留一點空間就好。'},
        people: [person({
            head: [58, 20], neck: [59, 31],
            sL: [49, 35], sR: [69, 35],
            eL: [46, 55], hL: [45, 73],
            eR: [75, 55], hR: [67, 76],
            pelvis: [58, 76],
            kL: [56, 107], fL: [57, 140],
            kR: [65, 106], fR: [71, 139],
        })],
        props: [GROUND],
    },
    {
        id: 'lean-wall',
        title: '靠牆單腳抬起',
        category: 'solo',
        framing: 'full',
        cues: ['肩膀輕輕靠牆，不要整個背貼上去', '一隻腳往後踩在牆上', '頭稍微往牆的反方向偏'],
        camera: {height: 'waist', zoom: '1x', tip: '站在斜前方 45 度拍，牆面會變成引導線，畫面更有深度。'},
        people: [person({
            head: [70, 21], neck: [71, 32],
            sL: [62, 36], sR: [80, 35],
            eL: [60, 56], hL: [61, 74],
            eR: [83, 55], hR: [85, 72],
            pelvis: [74, 77],
            kL: [70, 108], fL: [66, 140],
            kR: [64, 100], fR: [85, 116],
        })],
        props: [{d: 'M88 6 V140', kind: 'line'}, GROUND],
    },
    {
        id: 'hair-touch',
        title: '撥頭髮',
        category: 'solo',
        framing: 'half',
        cues: ['一隻手慢慢把頭髮往後撥', '眼睛往下看，再慢慢抬起來', '嘴巴放鬆，不用笑'],
        camera: {height: 'chest', zoom: '2x', tip: '用 2x 拍半身，臉不會變形；撥頭髮的動作一樣用連拍。'},
        people: [person({
            head: [59, 20],
            eR: [78, 30], hR: [66, 13],
        })],
    },
    {
        id: 'arms-crossed',
        title: '雙手抱胸看遠方',
        category: 'solo',
        framing: 'half',
        cues: ['手臂輕輕交叉，不要抱太緊', '下巴往前推一點點再往下收', '看向鏡頭旁邊遠一點的地方'],
        camera: {height: 'chest', zoom: '2x', tip: '讓人看的方向多留一點空間，畫面會比較舒服。'},
        people: [person({
            head: [62, 20],
            eL: [47, 52], hL: [66, 46],
            eR: [73, 52], hR: [54, 45],
        })],
    },
    {
        id: 'jump',
        title: '跳起來',
        category: 'solo',
        framing: 'full',
        cues: ['數到三一起跳', '雙手打開往上伸', '腳往後勾，看起來會跳得比較高'],
        camera: {height: 'low', zoom: '0.5x', tip: '蹲低用 0.5x 往上拍、開連拍，人會像飛起來；腳下多留一點空間。'},
        people: [person({
            head: [60, 14], neck: [60, 25],
            sL: [50, 29], sR: [70, 29],
            eL: [42, 15], hL: [38, 3],
            eR: [78, 15], hR: [82, 3],
            pelvis: [60, 70],
            kL: [52, 96], fL: [57, 118],
            kR: [68, 96], fR: [63, 118],
        })],
        props: [GROUND],
    },
    {
        id: 'collar',
        title: '拉外套領子',
        category: 'solo',
        framing: 'half',
        cues: ['雙手拉著外套領口', '肩膀放下來，不要聳肩', '眼睛直接看鏡頭'],
        camera: {height: 'chest', zoom: '2x', tip: '對焦在眼睛；陰天或樹蔭下拍，臉上的光最均勻。'},
        people: [person({
            eL: [44, 55], hL: [55, 40],
            eR: [76, 55], hR: [65, 40],
        })],
    },

    // ===== 坐姿 =====
    {
        id: 'stairs-sit',
        title: '坐階梯、手肘放膝蓋',
        category: 'sitting',
        framing: 'full',
        cues: ['坐在階梯上，雙腳踩低一階', '手肘放在膝蓋上，手輕輕交握', '身體往前傾一點點'],
        camera: {height: 'chest', zoom: '1x', tip: '相機跟坐著的人胸口同高，不要站著往下拍，人會變矮。'},
        people: [person({
            head: [53, 55], neck: [52, 66],
            sL: [50, 70], sR: [54, 70],
            eL: [70, 95], hL: [64, 79],
            eR: [72, 96], hR: [65, 80],
            pelvis: [48, 108],
            kL: [72, 99], fL: [75, 126],
            kR: [74, 101], fR: [79, 126],
        })],
        props: [{d: 'M6 110 H64 V126 H114', kind: 'line'}],
    },
    {
        id: 'chair-cross-legs',
        title: '坐椅子翹腳',
        category: 'sitting',
        framing: 'full',
        cues: ['坐椅子前半段，背挺直', '翹腳，上面那隻腳的腳尖往下壓', '雙手輕放在膝蓋上'],
        camera: {height: 'waist', zoom: '1x', tip: '從斜前方拍，翹起來的那隻腳朝向鏡頭會顯得腿長。'},
        people: [person({
            head: [53, 45], neck: [51, 56],
            sL: [49, 60], sR: [53, 60],
            eL: [56, 80], hL: [70, 91],
            eR: [58, 80], hR: [72, 90],
            pelvis: [48, 98],
            kL: [72, 99], fL: [74, 140],
            kR: [73, 93], fR: [88, 114],
        })],
        props: [{d: 'M38 100 H76 M42 100 V140 M72 100 V140 M38 100 V58', kind: 'line'}, GROUND],
    },
    {
        id: 'hug-knees',
        title: '坐地抱膝',
        category: 'sitting',
        framing: 'full',
        cues: ['坐在地上，雙腳收回來', '手臂環抱膝蓋', '頭靠在膝蓋上，或側頭看遠方'],
        camera: {height: 'waist', zoom: '1x', tip: '在草地、沙灘上拍最自然；蹲到跟人差不多高。'},
        people: [person({
            head: [49, 86], neck: [45, 97],
            sL: [44, 101], sR: [47, 101],
            eL: [58, 120], hL: [72, 118],
            eR: [60, 122], hR: [73, 121],
            pelvis: [44, 136],
            kL: [68, 109], fL: [76, 139],
            kR: [70, 111], fR: [79, 139],
        })],
        props: [GROUND],
    },

    // ===== 咖啡廳 =====
    {
        id: 'chin-rest',
        title: '托腮',
        category: 'cafe',
        framing: 'half',
        cues: ['手肘放桌上，手背輕輕碰下巴', '不要真的把臉的重量壓上去', '眼睛看窗外或看鏡頭都可以'],
        camera: {height: 'chest', zoom: '2x', tip: '坐對面拍，相機放低到桌面上方一點；窗光從側面進來最好看。'},
        people: [person({
            head: [60, 24], neck: [60, 35],
            sL: [50, 39], sR: [70, 39],
            eL: [44, 66], hL: [58, 68],
            eR: [72, 68], hR: [63, 34],
            pelvis: [60, 82],
        })],
        props: [{d: 'M6 70 H114', kind: 'line'}],
    },
    {
        id: 'cup-hold',
        title: '捧杯子低頭',
        category: 'cafe',
        framing: 'half',
        cues: ['雙手捧著杯子', '低頭看杯子，像要喝的前一秒', '肩膀放鬆往下'],
        camera: {height: 'chest', zoom: '2x', tip: '對焦在杯子或眼睛都好；背景的店內燈光會變成光斑。'},
        people: [person({
            head: [60, 24],
            eL: [46, 56], hL: [56, 50],
            eR: [74, 56], hR: [64, 50],
        })],
        props: [{d: 'M55 43 H65 V53 Q60 57 55 53 Z', kind: 'object'}],
    },
    {
        id: 'window-gaze',
        title: '看窗外',
        category: 'cafe',
        framing: 'half',
        cues: ['身體朝鏡頭，臉轉向窗戶', '手臂交疊放在桌上', '想一件開心的事，嘴角自然就會放鬆'],
        camera: {height: 'chest', zoom: '2x', tip: '點臉對焦，再把曝光往下拉，窗外才不會一片白。'},
        people: [person({
            head: [64, 22],
            eL: [44, 70], hL: [62, 72],
            eR: [76, 70], hR: [58, 72],
        })],
        props: [{d: 'M78 6 H100 V64 H78 Z', kind: 'fill'}, {d: 'M78 6 H100 V64 H78 Z M89 6 V64', kind: 'line'}, {d: 'M6 74 H114', kind: 'line'}],
    },

    // ===== 情侶 =====
    {
        id: 'hand-hold-walk',
        title: '牽手往前走（背影）',
        category: 'couple',
        framing: 'full',
        cues: ['兩個人牽手，背對鏡頭往前走', '其中一個人回頭看另一個人', '步伐放慢，比平常走路再慢一點'],
        camera: {height: 'waist', zoom: '1x', tip: '跟在後面幾步拍，把路或海岸線放進畫面當引導線。'},
        people: [
            person({hR: [78, 76], eR: [74, 56], kL: [54, 106], fL: [48, 139], kR: [65, 107], fR: [68, 140]}, {dx: -18}),
            person({hL: [42, 76], eL: [46, 56], kL: [55, 107], fL: [52, 140], kR: [66, 106], fR: [72, 139]}, {dx: 18, scale: 0.92, tone: 'partner'}),
        ],
        props: [GROUND],
    },
    {
        id: 'forehead-touch',
        title: '額頭相碰',
        category: 'couple',
        framing: 'half',
        cues: ['面對面，額頭輕輕靠在一起', '眼睛閉上或往下看', '一起笑出來的那一下最好看'],
        camera: {height: 'chest', zoom: '2x', tip: '從側面拍兩人的側臉，背景用逆光最有氛圍。'},
        people: [
            person({head: [68, 22], neck: [64, 33], eR: [76, 55], hR: [88, 64]}, {dx: -16}),
            person({head: [52, 24], neck: [56, 35], eL: [44, 57], hL: [32, 66]}, {dx: 16, scale: 0.94, tone: 'partner'}),
        ],
    },
    {
        id: 'back-hug',
        title: '背後擁抱',
        category: 'couple',
        framing: 'half',
        cues: ['後面的人從背後環抱，手放在前面的人腰上', '下巴輕輕靠在對方肩膀', '前面的人手覆在對方手上'],
        camera: {height: 'chest', zoom: '2x', tip: '兩張臉都要對焦清楚：點在兩人中間，或用人像模式的 f/4 左右。'},
        people: [
            person({head: [70, 16], neck: [68, 27], sL: [58, 31], sR: [78, 31], eL: [48, 50], hL: [60, 58], eR: [82, 50], hR: [64, 58]}),
            person({head: [60, 26], neck: [60, 37], sL: [51, 41], sR: [69, 41], eL: [48, 58], hL: [58, 60], eR: [72, 58], hR: [62, 60], pelvis: [60, 80]}, {tone: 'partner'}),
        ],
    },

    // ===== 朋友 =====
    {
        id: 'walk-together',
        title: '三人並排走',
        category: 'friends',
        framing: 'full',
        cues: ['三個人並排往鏡頭走', '互相聊天、不用看鏡頭', '走路速度一致，中間的人稍微往前'],
        camera: {height: 'waist', zoom: '1x', tip: '拍的人倒退走、開連拍，抓三個人都在笑的那一張。'},
        people: [
            person({eL: [45, 54], hL: [41, 71], eR: [74, 53], hR: [79, 69], kL: [54, 106], fL: [48, 139], kR: [66, 107], fR: [69, 140]}, {dx: -36, scale: 0.78, tone: 'partner'}),
            person({eL: [45, 53], hL: [42, 70], eR: [75, 54], hR: [78, 71], kL: [55, 107], fL: [52, 140], kR: [65, 106], fR: [71, 139]}, {scale: 0.84}),
            person({eL: [46, 54], hL: [41, 70], eR: [74, 54], hR: [80, 70], kL: [54, 106], fL: [49, 139], kR: [66, 107], fR: [70, 140]}, {dx: 36, scale: 0.78, tone: 'partner'}),
        ],
        props: [GROUND],
    },
    {
        id: 'laugh-together',
        title: '互看大笑',
        category: 'friends',
        framing: 'half',
        cues: ['兩個人互相看著對方', '講一件好笑的事，真的笑出來', '笑的時候頭可以往後仰'],
        camera: {height: 'chest', zoom: '1x', tip: '真的笑最多只有幾秒，全程開連拍。'},
        people: [
            person({head: [62, 19], eR: [72, 54], hR: [66, 66]}, {dx: -16}),
            person({head: [58, 19], eL: [48, 54], hL: [54, 66]}, {dx: 16, tone: 'partner'}),
        ],
    },

    // ===== 自拍 =====
    {
        id: 'mirror-selfie',
        title: '鏡子自拍',
        category: 'selfie',
        framing: 'full',
        cues: ['手機拿在胸口，不要擋住臉', '另一隻手插腰或拉衣角', '身體斜 45 度對鏡子'],
        camera: {height: 'chest', zoom: '1x', tip: '鏡子自拍用後鏡頭，畫質比前鏡頭好；手機稍微往下傾，腿會顯長。'},
        people: [person({
            head: [58, 20],
            eL: [42, 60], hL: [52, 72],
            eR: [76, 56], hR: [68, 50],
        })],
        props: [{d: 'M14 4 H106 V146 H14 Z', kind: 'line'}, {d: 'M64 38 H72 V53 H64 Z', kind: 'object'}],
    },
    {
        id: 'high-angle-selfie',
        title: '高角度自拍',
        category: 'selfie',
        framing: 'half',
        cues: ['手機舉到比頭高一點', '下巴往前、再往下收', '眼睛往上看鏡頭'],
        camera: {height: 'high', zoom: '1x', tip: '前鏡頭的廣角會讓臉邊變形，臉放在畫面中間比較安全。'},
        people: [person({
            eR: [80, 24], hR: [86, 8],
        })],
        props: [{d: 'M82 0 H91 V13 H82 Z', kind: 'object'}],
    },

    // ===== 旅行 =====
    {
        id: 'back-view-scenery',
        title: '背對鏡頭看風景',
        category: 'travel',
        framing: 'wide',
        cues: ['背對鏡頭，面向風景站好', '雙手自然打開，或一隻手扶帽子', '站在畫面三分之一的地方，不要站正中間'],
        camera: {height: 'waist', zoom: '0.5x', tip: '用 0.5x 把天空和地景都收進來，人小小的就好，風景才是主角。'},
        people: [person({eL: [44, 52], hL: [38, 68], eR: [76, 52], hR: [82, 68]}, {dx: -20, scale: 0.42})],
        props: [
            {d: 'M0 112 L22 92 L38 104 L62 80 L88 106 L104 96 L120 108 V140 H0 Z', kind: 'fill'},
            {d: 'M6 140 H114', kind: 'line'},
        ],
    },
    {
        id: 'landmark-third',
        title: '地標前、人放三分線',
        category: 'travel',
        framing: 'wide',
        cues: ['站在畫面左邊三分之一', '身體朝地標轉一點點', '跟地標保持幾步距離，不要擋到它'],
        camera: {height: 'waist', zoom: '1x', tip: '開格線，人放左邊那條線、地標放右邊那條線；從腰的高度拍，地標會更高大。'},
        people: [person({hR: [70, 70], eR: [74, 54]}, {dx: -20, scale: 0.55})],
        props: [
            {d: 'M74 140 V44 L80 26 L86 44 V140 Z', kind: 'fill'},
            {d: 'M40 0 V150 M80 0 V150', kind: 'guide'},
            {d: 'M6 140 H114', kind: 'line'},
        ],
    },
];
