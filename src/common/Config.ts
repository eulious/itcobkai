export const MOVE_INTERVAL = 500
export const LAMBDA_URL = "https://qqhitvdf6b.execute-api.ap-northeast-1.amazonaws.com/itcobkai"
export const S3_URL = "https://itcobkai.s3.ap-northeast-1.amazonaws.com"
export const AVATAR_URL = "https://cdn.discordapp.com"
export const ASSETS = (location.href.match("localhost") ? "." : S3_URL) + "/assets"
export const HAKASE = `${ASSETS}/hakase.jpg`