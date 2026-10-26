import {describe, expect, it} from 'vitest';
import {daySegments, lightWindows, phaseOf, skyColors, sunAltitude, upcomingWindow} from '@/lib/sun';
import {formatClock, startOfDayInZone} from '@/lib/zone';

const TAIPEI = {lat: 25.033, lng: 121.5654, tz: 'Asia/Taipei'};

describe('phaseOf', () => {
    it('依高度角分階段', () => {
        expect(phaseOf(30)).toBe('day');
        expect(phaseOf(6)).toBe('day');
        expect(phaseOf(2)).toBe('golden');
        expect(phaseOf(-4)).toBe('golden');
        expect(phaseOf(-5)).toBe('blue');
        expect(phaseOf(-10)).toBe('night');
    });
});

describe('lightWindows', () => {
    const day = startOfDayInZone(new Date('2026-10-26T04:00:00Z'), TAIPEI.tz);
    const windows = lightWindows(day, TAIPEI.lat, TAIPEI.lng);

    it('台北一般日子有四個時段，依時間排序且首尾相接', () => {
        expect(windows.map((w) => `${w.period}-${w.kind}`)).toEqual([
            'morning-blue', 'morning-golden', 'evening-golden', 'evening-blue',
        ]);
        expect(windows[0].end.getTime()).toBe(windows[1].start.getTime());
        expect(windows[2].end.getTime()).toBe(windows[3].start.getTime());
    });

    it('台北十月底傍晚黃金時刻約在 16:50～17:40 之間', () => {
        const golden = windows[2];
        expect(formatClock(golden.start, TAIPEI.tz) >= '16:40').toBe(true);
        expect(formatClock(golden.end, TAIPEI.tz) <= '17:45').toBe(true);
        // 時段內的高度角確實落在 -4°～6°
        const mid = new Date((golden.start.getTime() + golden.end.getTime()) / 2);
        expect(phaseOf(sunAltitude(mid, TAIPEI.lat, TAIPEI.lng))).toBe('golden');
    });

    it('永晝日（北極圈內夏至）缺少的時段會略過，只回有效的時段', () => {
        const tromso = startOfDayInZone(new Date('2026-06-21T12:00:00Z'), 'Europe/Oslo');
        const result = lightWindows(tromso, 69.65, 18.96);
        for (const w of result) {
            expect(Number.isNaN(w.start.getTime())).toBe(false);
        }
    });
});

describe('upcomingWindow', () => {
    it('白天時回傳今天傍晚的黃金時刻', () => {
        const now = new Date('2026-10-26T04:00:00Z'); // 台北 12:00
        const w = upcomingWindow(now, TAIPEI.lat, TAIPEI.lng, TAIPEI.tz);
        expect(w?.period).toBe('evening');
        expect(w?.kind).toBe('golden');
    });

    it('深夜時回傳隔天清晨的藍調時刻', () => {
        const now = new Date('2026-10-26T15:00:00Z'); // 台北 23:00
        const w = upcomingWindow(now, TAIPEI.lat, TAIPEI.lng, TAIPEI.tz);
        expect(w?.period).toBe('morning');
        expect(w?.kind).toBe('blue');
        expect(w!.start > now).toBe(true);
    });

    it('時段進行中時回傳該時段本身', () => {
        const day = startOfDayInZone(new Date('2026-10-26T04:00:00Z'), TAIPEI.tz);
        const golden = lightWindows(day, TAIPEI.lat, TAIPEI.lng)[2];
        const now = new Date(golden.start.getTime() + 60000);
        expect(upcomingWindow(now, TAIPEI.lat, TAIPEI.lng, TAIPEI.tz)?.start.getTime()).toBe(golden.start.getTime());
    });
});

describe('daySegments', () => {
    it('涵蓋一整天、首尾相接、相鄰階段不同', () => {
        const day = startOfDayInZone(new Date('2026-10-26T04:00:00Z'), TAIPEI.tz);
        const segs = daySegments(day, TAIPEI.lat, TAIPEI.lng);
        expect(segs[0].start.getTime()).toBe(day.getTime());
        expect(segs.at(-1)!.end.getTime()).toBe(day.getTime() + 24 * 3600 * 1000);
        for (let i = 1; i < segs.length; i++) {
            expect(segs[i].start.getTime()).toBe(segs[i - 1].end.getTime());
            expect(segs[i].phase).not.toBe(segs[i - 1].phase);
        }
        expect(segs.map((s) => s.phase)).toEqual(['night', 'blue', 'golden', 'day', 'golden', 'blue', 'night']);
    });
});

describe('skyColors', () => {
    it('在定義點上回傳原色、超出範圍時夾住', () => {
        expect(skyColors(0)).toEqual({zenith: '#5468a8', horizon: '#f2a05a'});
        expect(skyColors(-40)).toEqual(skyColors(-18));
        expect(skyColors(90)).toEqual(skyColors(60));
    });

    it('兩個定義點之間內插', () => {
        expect(skyColors(3).horizon).toMatch(/^#[0-9a-f]{6}$/);
        expect(skyColors(3).horizon).not.toBe(skyColors(0).horizon);
    });
});
