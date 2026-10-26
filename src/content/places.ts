// 不開定位時可以手選的城市（座標取市中心；日照時間在同一個城市內差不到一分鐘）
export type Place = {
    name: string;
    lat: number;
    lng: number;
    timeZone: string;
    source: 'gps' | 'preset';
};

export const PRESET_PLACES: Place[] = [
    {name: '台北', lat: 25.0330, lng: 121.5654, timeZone: 'Asia/Taipei', source: 'preset'},
    {name: '台中', lat: 24.1477, lng: 120.6736, timeZone: 'Asia/Taipei', source: 'preset'},
    {name: '台南', lat: 22.9999, lng: 120.2270, timeZone: 'Asia/Taipei', source: 'preset'},
    {name: '高雄', lat: 22.6273, lng: 120.3014, timeZone: 'Asia/Taipei', source: 'preset'},
    {name: '花蓮', lat: 23.9910, lng: 121.6114, timeZone: 'Asia/Taipei', source: 'preset'},
    {name: '東京', lat: 35.6762, lng: 139.6503, timeZone: 'Asia/Tokyo', source: 'preset'},
    {name: '京都', lat: 35.0116, lng: 135.7681, timeZone: 'Asia/Tokyo', source: 'preset'},
    {name: '大阪', lat: 34.6937, lng: 135.5023, timeZone: 'Asia/Tokyo', source: 'preset'},
    {name: '首爾', lat: 37.5665, lng: 126.9780, timeZone: 'Asia/Seoul', source: 'preset'},
    {name: '香港', lat: 22.3193, lng: 114.1694, timeZone: 'Asia/Hong_Kong', source: 'preset'},
    {name: '曼谷', lat: 13.7563, lng: 100.5018, timeZone: 'Asia/Bangkok', source: 'preset'},
    {name: '新加坡', lat: 1.3521, lng: 103.8198, timeZone: 'Asia/Singapore', source: 'preset'},
];
