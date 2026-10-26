import {describe, expect, it} from 'vitest';
import {moveItem, sanitizeFavorites, sanitizeItems} from '@/lib/shotList';

const KNOWN = new Set(['jump', 'cup-hold']);

describe('sanitizeItems', () => {
    it('保留合法項目、丟掉不認得的姿勢與空白備註', () => {
        const raw = [
            {id: 'a', poseId: 'jump', done: true},
            {id: 'b', poseId: 'deleted-pose'},
            {id: 'c', note: '  咖啡店門口全身  ', done: 'yes'},
            {id: 'd', note: '   '},
            {poseId: 'jump'},
            'garbage',
        ];
        expect(sanitizeItems(raw, KNOWN)).toEqual([
            {id: 'a', poseId: 'jump', note: undefined, done: true},
            {id: 'c', poseId: undefined, note: '咖啡店門口全身', done: false},
        ]);
    });

    it('不是陣列時回空清單', () => {
        expect(sanitizeItems(undefined, KNOWN)).toEqual([]);
        expect(sanitizeItems({}, KNOWN)).toEqual([]);
    });
});

describe('sanitizeFavorites', () => {
    it('去重、只留認得的姿勢', () => {
        expect(sanitizeFavorites(['jump', 'jump', 'x', 3, 'cup-hold'], KNOWN)).toEqual(['jump', 'cup-hold']);
    });
});

describe('moveItem', () => {
    it('上下移動一格', () => {
        expect(moveItem([1, 2, 3], 1, -1)).toEqual([2, 1, 3]);
        expect(moveItem([1, 2, 3], 1, 1)).toEqual([1, 3, 2]);
    });

    it('邊界不動', () => {
        const list = [1, 2, 3];
        expect(moveItem(list, 0, -1)).toBe(list);
        expect(moveItem(list, 2, 1)).toBe(list);
    });
});
