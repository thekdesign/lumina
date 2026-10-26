// 時區工具：選了別的城市（例如人在台北、查東京的日落）時，時間要用那個城市的當地時間顯示，
// 「今天」也要用那個城市的日期算。只靠 Intl，不引入時區資料庫。

function zonedParts(instant: Date, timeZone: string) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).formatToParts(instant);
    const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value);
    return {year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute'), second: get('second')};
}

/** 某個瞬間在指定時區的 UTC 偏移（分鐘，東邊為正；台北 = 480） */
export function zoneOffsetMinutes(instant: Date, timeZone: string): number {
    const p = zonedParts(instant, timeZone);
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    return Math.round((asUtc - instant.getTime()) / 60000);
}

/** 指定時區裡，該瞬間所在那一天的 00:00 */
export function startOfDayInZone(instant: Date, timeZone: string): Date {
    const p = zonedParts(instant, timeZone);
    const midnightAsUtc = Date.UTC(p.year, p.month - 1, p.day);
    // 先用當下的偏移猜，再用猜出來那一刻的偏移校正一次（處理夏令時間切換日）
    const guess = midnightAsUtc - zoneOffsetMinutes(instant, timeZone) * 60000;
    return new Date(midnightAsUtc - zoneOffsetMinutes(new Date(guess), timeZone) * 60000);
}

/** 24 小時制的 HH:mm（當地時間） */
export function formatClock(instant: Date, timeZone: string): string {
    return new Intl.DateTimeFormat('zh-TW', {timeZone, hourCycle: 'h23', hour: '2-digit', minute: '2-digit'}).format(instant);
}

/** 裝置目前的時區（GPS 定位時用） */
export function deviceTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
