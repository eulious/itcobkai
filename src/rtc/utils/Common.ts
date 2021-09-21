export function throttle(func: Function, limit: number): Function {
    // 多分使ってない
    let inThrottle: boolean;
    return function (this: any): any {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            inThrottle = true;
            func.apply(context, args);
            setTimeout(() => (inThrottle = false), limit)
        }
    }
}

export function beep() {
    // 動作確認用の音を鳴らす
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.1;
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    setTimeout(() => osc.stop(), 200)
}