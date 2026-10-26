import {describe, expect, it} from 'vitest';
import {formatClock, startOfDayInZone, zoneOffsetMinutes} from '@/lib/zone';

describe('zone', () => {
    it('算出台北與東京的 UTC 偏移', () => {
        const instant = new Date('2026-10-26T04:00:00Z');
        expect(zoneOffsetMinutes(instant, 'Asia/Taipei')).toBe(480);
        expect(zoneOffsetMinutes(instant, 'Asia/Tokyo')).toBe(540);
    });

    it('當地 00:00 以該城市的日期為準', () => {
        // UTC 10/26 20:00 = 台北 10/27 04:00
        const instant = new Date('2026-10-26T20:00:00Z');
        expect(startOfDayInZone(instant, 'Asia/Taipei').toISOString()).toBe('2026-10-26T16:00:00.000Z');
    });

    it('夏令時間切換日也對齊到當地 00:00', () => {
        // 紐約 2026-03-08 凌晨 2 點切夏令；那天 00:00 還是 EST（UTC-5）
        const instant = new Date('2026-03-08T18:00:00Z');
        expect(startOfDayInZone(instant, 'America/New_York').toISOString()).toBe('2026-03-08T05:00:00.000Z');
    });

    it('時間格式為 24 小時制', () => {
        expect(formatClock(new Date('2026-10-26T09:05:00Z'), 'Asia/Taipei')).toBe('17:05');
    });
});
