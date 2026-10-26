import {describe, expect, it} from 'vitest';
import {coverSourceRect, fitFrame, rollDegrees} from '@/lib/viewfinder';

describe('fitFrame', () => {
    it('直式手機：寬度撐滿，3:4 框', () => {
        const f = fitFrame(390, 844, 3 / 4, 200);
        expect(f.w).toBe(390);
        expect(f.h).toBe(520);
        expect(f.x).toBe(0);
        expect(f.y).toBe(62);
    });

    it('螢幕太矮時改以高度為準、水平置中', () => {
        const f = fitFrame(800, 600, 3 / 4);
        expect(f.h).toBe(600);
        expect(f.w).toBe(450);
        expect(f.x).toBe(175);
    });
});

describe('coverSourceRect', () => {
    it('整個容器對應到影片被裁切後的可見範圍', () => {
        // 1280x720 橫向影片鋪滿 390x844 直式容器：以高度為準縮放，左右被裁
        const r = coverSourceRect(1280, 720, 390, 844, {x: 0, y: 0, w: 390, h: 844});
        expect(r.h).toBeCloseTo(720);
        expect(r.y).toBeCloseTo(0);
        expect(r.x + r.w / 2).toBeCloseTo(640);
    });

    it('影片和容器同比例時是等比縮放', () => {
        const r = coverSourceRect(1000, 2000, 500, 1000, {x: 100, y: 200, w: 300, h: 400});
        expect(r).toEqual({x: 200, y: 400, w: 600, h: 800});
    });
});

describe('rollDegrees', () => {
    it('直拿、完全水平時是 0', () => {
        expect(rollDegrees(0, -9.8, 0)).toBeCloseTo(0);
    });

    it('往右歪時為正、往左為負', () => {
        expect(rollDegrees(1.7, -9.65, 0)!).toBeGreaterThan(9);
        expect(rollDegrees(-1.7, -9.65, 0)!).toBeLessThan(-9);
    });

    it('平放時回 undefined', () => {
        expect(rollDegrees(0.1, -0.2, -9.8)).toBeUndefined();
    });
});
