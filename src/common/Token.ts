import { LAMBDA_URL } from "./Config"

export default class Token {
    private c: { [key: string]: string } = {}
    private d: { [key: string]: string } = {}

    constructor() {
        const a = 'BsEaXfLKFHpxk1DSwTu4ycAQVitN70z6dgbjYJ2ZPCvWI8OGRUnmMqr5l3oh9e'
        const b = '1Nd6GmgkahSX0f3e8TMlFR4oOJHEC5Bsrx9jIipAvVWnYu2wqPzLDbKcUyZ7Qt'
        for (let i = 0; i < a.length; i++) {
            this.c[a[i]] = b[i]
            this.d[b[i]] = a[i]
        }
    }

    public async get(auth: "discord" | "db"): Promise<string> {
        let tokens: any
        try {
            tokens = JSON.parse(localStorage[auth])
        } catch {
            console.error("token not found")
            return ""
        }
        if (tokens.expires_at < new Date().getTime() / 1000) {
            tokens = await this.fetch(auth, this.decode(tokens.refresh))
            return tokens.access
        } else {
            return this.decode(tokens.access)
        }
    }

    public save(auth: "discord" | "db", tokens: any) {
        localStorage[auth] = JSON.stringify({
            access: this.encode(tokens.access),
            refresh: this.encode(tokens.refresh),
            expires_at: tokens.expires_at
        })
    }

    private async fetch(auth: "discord" | "db", refresh: string) {
        const res = await fetch(LAMBDA_URL, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json", },
            body: JSON.stringify({
                _api: `/refresh/${auth}`,
                _refresh: refresh
            })
        });
        const d = await res.json();
        if (d.status === "ng") console.error(d.detail, false);
        else console.log(`refresh token: ${auth}`)
        this.save(auth, d)
        return d
    }

    private encode(s: string) {
        return Array.from(s).map(x => this.c[x] ? this.c[x] : x).join('')
    }

    private decode(s: string) {
        return Array.from(s).map(x => this.d[x] ? this.d[x] : x).join('')
    }

    // lsSave(key: string, word: string) {
    //     // const mm = CryptoJS.AES.encrypt(word, AES).toString()
    //     const mm = Array.from(word).map(x => this.c[x] ? this.c[x] : x).join('')
    //     localStorage[key] = mm
    // }

    // lsLoad(key: string): string | undefined {
    //     const mm = localStorage[key] as string
    //     if (mm) return Array.from(mm).map(x => this.d[x] ? this.d[x] : x).join('')
    //     // if (mm) return CryptoJS.AES.decrypt(mm, AES).toString(CryptoJS.enc.Utf8)
    // }
}