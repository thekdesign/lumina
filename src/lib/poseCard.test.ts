import {describe, expect, it} from 'vitest';
import {wrapText} from '@/lib/poseCard';

describe('wrapText', () => {
    const measure = (s: string) => [...s].length * 10;

    it('超過寬度就換行', () => {
        expect(wrapText('一二三四五六七', 30, measure)).toEqual(['一二三', '四五六', '七']);
    });

    it('放得下就一行、空字串回空陣列', () => {
        expect(wrapText('一二', 30, measure)).toEqual(['一二']);
        expect(wrapText('', 30, measure)).toEqual([]);
    });
});
