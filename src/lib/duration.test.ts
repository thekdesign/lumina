import {describe, expect, it} from 'vitest';
import {formatDuration, splitDuration} from '@/lib/duration';

describe('duration', () => {
    it('拆成小時與分鐘，不足一分鐘進位', () => {
        expect(splitDuration(84 * 60000)).toEqual({hours: 1, minutes: 24});
        expect(splitDuration(30000)).toEqual({hours: 0, minutes: 1});
        expect(splitDuration(-5000)).toEqual({hours: 0, minutes: 0});
    });

    it('格式化', () => {
        expect(formatDuration(12 * 60000)).toBe('12 分');
        expect(formatDuration(120 * 60000)).toBe('2 小時');
        expect(formatDuration(84 * 60000)).toBe('1 小時 24 分');
    });
});
