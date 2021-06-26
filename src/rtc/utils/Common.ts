export function throttle(func: Function, limit: number): Function {
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
    const ctx = new AudioContext()
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.01;
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    setTimeout(() => osc.stop(), 200)
}