/** 把毫秒拆成「小時 + 分鐘」（無條件進位到分鐘，倒數不會顯示 0 分還沒開始） */
export function splitDuration(ms: number): {hours: number; minutes: number} {
    const total = Math.max(0, Math.ceil(ms / 60000));
    return {hours: Math.floor(total / 60), minutes: total % 60};
}

/** 「1 小時 24 分」「12 分」 */
export function formatDuration(ms: number): string {
    const {hours, minutes} = splitDuration(ms);
    if (hours === 0) {
        return `${minutes} 分`;
    }
    return minutes === 0 ? `${hours} 小時` : `${hours} 小時 ${minutes} 分`;
}
