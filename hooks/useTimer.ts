import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
    isActive: boolean;
    duration: number; // 直接传入时长
    onTimeUp: () => void;
    resetKey?: number; // 用于强制重置的 key
}

export function useTimer({ isActive, duration, onTimeUp, resetKey }: UseTimerOptions) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const prevResetKeyRef = useRef<number | undefined>(resetKey);

    // 当 duration 变化时，重置时间
    useEffect(() => {
        setTimeLeft(duration);
    }, [duration]);

    // 当 resetKey 变化时，重置时间
    useEffect(() => {
        if (resetKey !== prevResetKeyRef.current) {
            setTimeLeft(duration);
            prevResetKeyRef.current = resetKey;
        }
    }, [resetKey, duration]);

    // 计时器逻辑
    useEffect(() => {
        if (!isActive) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0.1) {
                    onTimeUp();
                    return 0;
                }
                return prev - 0.1;
            });
        }, 100);

        return () => clearInterval(timer);
    }, [isActive, onTimeUp]);

    const progress = duration > 0 ? (timeLeft / duration) * 100 : 0;

    const addTime = useCallback((seconds: number) => {
        setTimeLeft(prev => Math.min(duration, prev + seconds));
    }, [duration]);

    return { timeLeft, progress, addTime };
}
