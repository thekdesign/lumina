import {describe, expect, it} from 'vitest';
import {cameraY, person, personShapes, place, STANDING} from '@/lib/figure';

describe('figure', () => {
    it('沒有位移縮放時座標不變', () => {
        const p = person();
        expect(place(p, STANDING.head)).toEqual([60, 20]);
    });

    it('以腳底中心縮放：腳不離地、頭往下', () => {
        const p = person({}, {scale: 0.5});
        expect(place(p, STANDING.fL)[1]).toBe(140);
        expect(place(p, STANDING.head)).toEqual([60, 80]);
    });

    it('雙人牽手：左右各推 18，手在中間碰到', () => {
        const a = person({hR: [78, 76]}, {dx: -18});
        const b = person({hL: [42, 76]}, {dx: 18});
        expect(place(a, a.body.hR)).toEqual(place(b, b.body.hL));
    });

    it('縮小的人頭與線條跟著縮，線條有下限', () => {
        const shapes = personShapes(person({}, {scale: 0.3}));
        expect(shapes.head.r).toBe(2.4);
        expect(shapes.stroke).toBe(1.6);
        expect(shapes.paths).toHaveLength(3);
    });

    it('半身照不畫腿，軀幹延伸到畫面下緣', () => {
        const shapes = personShapes(person(), {legs: false});
        expect(shapes.paths).toHaveLength(2);
        expect(shapes.paths[0]).toBe('M60 31 L60 140');
    });

    it('相機高度跟著主角的姿勢與比例換算', () => {
        expect(cameraY(person(), 'eye')).toBe(20);
        expect(cameraY(person(), 'waist')).toBe(76);
        expect(cameraY(person(), 'high')).toBe(2);
        expect(cameraY(person({}, {scale: 0.5}), 'eye')).toBe(80);
        // 坐著（頭在 55）時，胸口高度比站著低
        const sitting = person({head: [53, 55], neck: [52, 66], pelvis: [48, 108]});
        expect(cameraY(sitting, 'chest')).toBeGreaterThan(cameraY(person(), 'chest'));
    });
});
