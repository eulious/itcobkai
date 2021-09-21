const CONFIG = {
    OUTER: 13,  // マップの大きさ
    INNER: 2,   // マップを更新をする幅
}

export const MAP = {
    PLAIN: 0,       // 公開エリア
    BLOCK: 1,       // 新入禁止エリア
    AREA: 2,        // エリア
    AREA_BLOCK: 3,  // 新入禁止で接続されるエリア
}

export default CONFIG

// RTCクライアントをkinesisとskywayから指定
// kinesisは長らくメンテしていないため使用不可
export const RTC_CORE = "skyway"