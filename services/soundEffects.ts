// 音效系统工具 - 解决 AudioContext 挂起问题

let audioContext: AudioContext | null = null;

// 获取或创建 AudioContext，并在需要时恢复
const getAudioContext = (): AudioContext | null => {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        // 如果 AudioContext 被挂起，尝试恢复
        if (audioContext.state === 'suspended') {
            audioContext.resume().catch(() => {});
        }
        return audioContext;
    } catch (e) {
        return null;
    }
};

// 创建柔和的音效
const createTone = (freq: number, duration: number, volume: number = 0.15) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

    // 柔和的 ADSR 包络
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
};

// 泡泡声 - 选中音效
export const playBubbleSound = (value?: number) => {
    // 根据数字大小调整音调（越大音调越低）
    const baseFreq = value ? Math.max(400, 800 - value * 20) : 600;
    const variation = Math.random() * 50 - 25;
    createTone(baseFreq + variation, 0.08, 0.12);
};

// 点击音效 - 水滴声
export const playTapSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    // 较低的起始频率
    oscillator.frequency.setValueAtTime(500, ctx.currentTime);
    // 快速下降到低频，模拟水滴声
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);

    // 音量包络
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.08);
};

// 融合音效 - 类似水滴融合的 "Bloop"
export const playFusionSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // 两个频率略微不同的正弦波，创造"Bloop"效果
    [400, 500].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        // 频率快速下降，模拟水滴声
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    });
};

// 匹配成功音效 - 上扬的愉悦音效
export const playSuccessSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.15, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // 愉悦的上扬音阶
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // 钟声般的包络
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.03 + (i * 0.04));
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5 + (i * 0.04));

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime + (i * 0.04));
        osc.stop(ctx.currentTime + 0.6 + (i * 0.04));
    });
};

// 错误音效 - 柔和的低音提示
export const playErrorSound = () => {
    createTone(200, 0.15, 0.1);
};

// 抽卡音效 - 神秘悦耳
export const playGachaSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.1, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // 神秘和弦
    const notes = [392, 494, 587.33]; // G4, B4, D5

    notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
    });
};

// 纸屑绽放音效 - 目标完成时
export const playConfettiSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // 快速连续的高音
    const notes = [1046.50, 1318.51, 1567.98]; // C6, E6, G6

    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01 + (i * 0.03));
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3 + (i * 0.03));

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime + (i * 0.03));
        osc.stop(ctx.currentTime + 0.4 + (i * 0.03));
    });
};
