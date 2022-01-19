const LAMBDA_URL = "https://olnuwpvr6b.execute-api.ap-northeast-1.amazonaws.com/api"
    + (location.href.match("localhost") ? "/dev/itcobkai" : "/itcobkai")

type Method = "POST" | "PUT" | "GET" | "DELETE"

export default async function request(method: Method, api: string, post: any = {}, through?: boolean): Promise<any> {
    return Request.instance.request(method, api, post, through)
}

export async function init() {
    const req = Request.instance
    if (req.token === "") {
        console.log("initialize token")
        const res = await req.request("GET", "/token", {}, true)
        req.token = res.token
        req.blockFlag = false
        return res
    }
}

class Request {
    private static _instance: Request
    public token: string = ""
    public blockFlag: boolean = true
    private safety = 4
    private constructor() {
        setInterval(() => {
            if (this.safety < 4) this.safety++
        }, 1000)
    }

    public static get instance(): Request {
        if (!this._instance) this._instance = new Request()
        return this._instance
    }

    public async request(method: Method, api: string, post: any = {}, through?: boolean): Promise<any> {
        if (this.safety-- < 0) alert("safety")
        await this.blockRequest(through)
        console.log("request", method, api, post)
        const res = await fetch(LAMBDA_URL, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: { "Content-Type": "application/json", },
            body: JSON.stringify({
                ...post,
                _token: this.token,
                _api: api,
                _method: method
            })
        });

        const json = await res.json()
        if (res.status !== 200) {
            console.log(json.detail)
        }
        if (res.status === 401) {
            await this.handle401Error(json)
            return await this.request(method, api, post, through)
        } else {
            console.log("response", method, api, json)
            return json
        }
    }

    private async blockRequest(through?: boolean) {
        if (!through) {
            while (this.blockFlag) {
                await new Promise(resolve => setTimeout(resolve, 500))
            }
        }
    }

    private async handle401Error(json: any) {
        if (json.detail.match("無効なトークンです")) {
            const res = await this.request("GET", "/token", {}, true)
            this.token = res.token
        } else {
            window.alert(`認証に失敗しました: ${json.detail}`)
            location.href = location.href.split("?")[0] + "?mode=auth"
        }
    }
}