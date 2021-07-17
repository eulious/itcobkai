import { LAMBDA_URL } from "./Config"
import aesjs from "aes-js"

export default class Token {
    private key = aesjs.utils.utf8.toBytes("ITCOBKAI_EULIOUS")

    public async get(): Promise<string> {
        if (!(localStorage.expires_at && localStorage.access && localStorage.refresh)) {
            window.alert("認証して下さい")
            location.href = location.href.split("?")[0] + "?mode=auth"
        }
        if (localStorage.expires_at < new Date().getTime() / 1000) {
            const res = await fetch(LAMBDA_URL, {
                method: "POST",
                mode: "cors",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify({
                    _api: "/refresh",
                    _refresh: this.decode(localStorage.refresh)
                })
            });
            const d = await res.json();
            if (d.status === "ng") {
                window.alert(`認証エラー: ${d.detail}`)
                location.href = location.href.split("?")[0] + "?mode=auth"
            }
            this.save(d.secret)
        }
        return this.decode(localStorage.access)
    }

    public save(secret: any) {
        console.log(localStorage, secret)
        localStorage.access = this.encode(secret.access);
        localStorage.refresh = this.encode(secret.refresh);
        localStorage.expires_at = secret.expires_at
    }

    private encode(s: string) {
        const ctr = new aesjs.ModeOfOperation.ctr(this.key, new aesjs.Counter(5));
        const encrypted = ctr.encrypt(aesjs.utils.utf8.toBytes(s));
        return aesjs.utils.hex.fromBytes(encrypted);
    }

    private decode(s: string) {
        const ctr = new aesjs.ModeOfOperation.ctr(this.key, new aesjs.Counter(5));
        const decrypted = ctr.decrypt(aesjs.utils.hex.toBytes(s));
        return aesjs.utils.utf8.fromBytes(decrypted);
    }
}