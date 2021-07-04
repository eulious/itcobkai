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
        localStorage.access = this.encode(secret.access);
        localStorage.refresh = this.encode(secret.refresh);
        localStorage.expires_at = secret.expires_at
    }

    private encode(s: string) {
        return Array.from(s).map(x => this.c[x] ? this.c[x] : x).join('')
    }

    private decode(s: string) {
        return Array.from(s).map(x => this.d[x] ? this.d[x] : x).join('')
    }
}