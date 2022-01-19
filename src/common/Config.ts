export const MOVE_INTERVAL = 500
export const LAMBDA_URL = "https://qqhitvdf6b.execute-api.ap-northeast-1.amazonaws.com/itcobkai"
export const S3_URL = "https://itcobkai.s3.ap-northeast-1.amazonaws.com"
export const AVATAR_URL = "https://cdn.discordapp.com"
export const ASSETS = (location.href.match("localhost") ? "." : S3_URL) + "/assets"
export const HAKASE = `${ASSETS}/hakase.jpg`

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