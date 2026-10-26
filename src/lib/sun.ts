import * as SunCalc from 'suncalc';
import {startOfDayInZone} from '@/lib/zone';

// 光線階段用太陽高度角定義（攝影圈常用的說法）：
//   藍調時刻 -6° ～ -4°：太陽在地平線下，天空整片深藍、城市燈剛亮
//   黃金時刻 -4° ～ 6°：太陽很低，光線暖、柔、影子長
// suncalc 內建 6°（goldenHour / goldenHourEnd）與 -6°（dawn / dusk），只需補 -4° 這條線。
export const BLUE_LOW = -6;
export const BLUE_HIGH = -4;
export const GOLDEN_HIGH = 6;

SunCalc.addTime(BLUE_HIGH, 'blueHourEnd', 'blueHour');

export type LightPhase = 'night' | 'blue' | 'golden' | 'day';

export type LightWindow = {
    kind: 'blue' | 'golden';
    period: 'morning' | 'evening';
    start: Date;
    end: Date;
};

export type PhaseSegment = {phase: LightPhase; start: Date; end: Date};

const DAY_MS = 24 * 60 * 60 * 1000;

/** 太陽高度角（度；suncalc 2.x 起所有角度都是度，不是弧度） */
export function sunAltitude(instant: Date, lat: number, lng: number): number {
    return SunCalc.getPosition(instant, lat, lng).altitude;
}

export function phaseOf(altitude: number): LightPhase {
    if (altitude >= GOLDEN_HIGH) {
        return 'day';
    }
    if (altitude >= BLUE_HIGH) {
        return 'golden';
    }
    if (altitude >= BLUE_LOW) {
        return 'blue';
    }
    return 'night';
}

// 永晝 / 永夜時 suncalc 對到不了的高度角回 null
function asDate(value: unknown): Date | undefined {
    return value instanceof Date && !Number.isNaN(value.getTime()) ? value : undefined;
}

/**
 * 某一天（dayStart = 當地 00:00）的四個光線時段：清晨藍調、清晨黃金、傍晚黃金、傍晚藍調。
 * 高緯度的永晝 / 永夜日會缺某些時段（suncalc 回 null），直接略過。
 */
export function lightWindows(dayStart: Date, lat: number, lng: number): LightWindow[] {
    // 用當地正午去問，suncalc 才會回「這一天」的日出日落
    const t = SunCalc.getTimes(new Date(dayStart.getTime() + DAY_MS / 2), lat, lng);
    const spans: Array<Pick<LightWindow, 'kind' | 'period'> & {start: unknown; end: unknown}> = [
        {kind: 'blue', period: 'morning', start: t.dawn, end: t.blueHourEnd},
        {kind: 'golden', period: 'morning', start: t.blueHourEnd, end: t.goldenHourEnd},
        {kind: 'golden', period: 'evening', start: t.goldenHour, end: t.blueHour},
        {kind: 'blue', period: 'evening', start: t.blueHour, end: t.dusk},
    ];
    const result: LightWindow[] = [];
    for (const {kind, period, start, end} of spans) {
        const s = asDate(start);
        const e = asDate(end);
        if (s && e && s < e) {
            result.push({kind, period, start: s, end: e});
        }
    }
    return result;
}

/**
 * 現在正在進行、或下一個要來的光線時段（看今天和之後兩天）。
 * 永晝 / 永夜期間可能找不到，回 undefined。
 */
export function upcomingWindow(now: Date, lat: number, lng: number, timeZone: string): LightWindow | undefined {
    const today = startOfDayInZone(now, timeZone);
    for (let i = 0; i < 3; i++) {
        // 加 DAY_MS 再對齊到當地 00:00，跨夏令時間也不會歪
        const day = startOfDayInZone(new Date(today.getTime() + i * DAY_MS + DAY_MS / 2), timeZone);
        const found = lightWindows(day, lat, lng).find((w) => w.end > now);
        if (found) {
            return found;
        }
    }
    return undefined;
}

/** 一整天的光線階段色帶（每 stepMinutes 取樣一次、相同階段合併），給時間軸畫圖用 */
export function daySegments(dayStart: Date, lat: number, lng: number, stepMinutes = 5): PhaseSegment[] {
    const step = stepMinutes * 60000;
    const end = dayStart.getTime() + DAY_MS;
    const segments: PhaseSegment[] = [];
    for (let t = dayStart.getTime(); t < end; t += step) {
        const phase = phaseOf(sunAltitude(new Date(t), lat, lng));
        const last = segments.at(-1);
        if (last && last.phase === phase) {
            last.end = new Date(Math.min(t + step, end));
        } else {
            segments.push({phase, start: new Date(t), end: new Date(Math.min(t + step, end))});
        }
    }
    return segments;
}

// ===== 天空配色：依太陽高度角內插，首頁的天空色帶用 =====

type Rgb = [number, number, number];

// [高度角, 天頂色, 地平線色]
const SKY_STOPS: Array<[number, string, string]> = [
    [-18, '#0b0d24', '#1a1c3d'],
    [-6, '#1e2457', '#4a4e8c'],
    [-4, '#2e3a7a', '#c9708a'],
    [0, '#5468a8', '#f2a05a'],
    [6, '#7fa3d6', '#f7c98a'],
    [20, '#6fa8dc', '#cfe4f5'],
    [60, '#4f94d4', '#bbd9f2'],
];

function hexToRgb(hex: string): Rgb {
    const n = Number.parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: Rgb): string {
    return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

function mix(a: string, b: string, t: number): string {
    const ra = hexToRgb(a);
    const rb = hexToRgb(b);
    return rgbToHex([0, 1, 2].map((i) => ra[i] + (rb[i] - ra[i]) * t) as Rgb);
}

export function skyColors(altitude: number): {zenith: string; horizon: string} {
    const first = SKY_STOPS[0];
    const last = SKY_STOPS[SKY_STOPS.length - 1];
    if (altitude <= first[0]) {
        return {zenith: first[1], horizon: first[2]};
    }
    if (altitude >= last[0]) {
        return {zenith: last[1], horizon: last[2]};
    }
    const i = SKY_STOPS.findIndex(([alt]) => alt > altitude);
    const [a0, z0, h0] = SKY_STOPS[i - 1];
    const [a1, z1, h1] = SKY_STOPS[i];
    const t = (altitude - a0) / (a1 - a0);
    return {zenith: mix(z0, z1, t), horizon: mix(h0, h1, t)};
}
