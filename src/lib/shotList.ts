// 拍攝清單的純邏輯（不碰儲存），方便測試。
// 項目可以是姿勢卡（poseId），也可以是自己打的一行字（note）。

export type ShotItem = {
    id: string;
    poseId?: string;
    note?: string;
    done: boolean;
};

/** 從儲存讀回來的資料不一定可信（舊版格式、內容被刪掉的姿勢），只留下看得懂的項目 */
export function sanitizeItems(raw: unknown, knownPoseIds: Set<string>): ShotItem[] {
    if (!Array.isArray(raw)) {
        return [];
    }
    const result: ShotItem[] = [];
    for (const r of raw) {
        if (!r || typeof r !== 'object' || typeof r.id !== 'string') {
            continue;
        }
        const poseId = typeof r.poseId === 'string' && knownPoseIds.has(r.poseId) ? r.poseId : undefined;
        const note = typeof r.note === 'string' && r.note.trim() ? r.note.trim() : undefined;
        if (!poseId && !note) {
            continue;
        }
        result.push({id: r.id, poseId, note, done: r.done === true});
    }
    return result;
}

export function sanitizeFavorites(raw: unknown, knownPoseIds: Set<string>): string[] {
    if (!Array.isArray(raw)) {
        return [];
    }
    return [...new Set(raw.filter((id): id is string => typeof id === 'string' && knownPoseIds.has(id)))];
}

/** 把第 index 項往上（-1）或往下（+1）移一格；超出範圍就原樣回傳 */
export function moveItem<T>(list: T[], index: number, delta: -1 | 1): T[] {
    const target = index + delta;
    if (index < 0 || index >= list.length || target < 0 || target >= list.length) {
        return list;
    }
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
}
