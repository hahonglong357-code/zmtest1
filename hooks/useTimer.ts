import { useState, useEffect, useCallback, useRef } from 'react';
import { GAME_PARAMS } from '../gameConfig';

interface UseTimerOptions {
    isActive: boolean;
    duration: number; // 直接传入时长
    onTimeUp: () => void;
    resetKey?: number; // 用于强制重置的 key
    initialTimeLeft?: number; // 初始剩余时间
}

export function useTimer({ isActive, duration, onTimeUp, resetKey, initialTimeLeft }: UseTimerOptions) {
    // 确保初始时间不超过全局最大值
    const initialTime = initialTimeLeft ? Math.min(initialTimeLeft, GAME_PARAMS.TIMER_LIMITS.GLOBAL_MAX) : duration;
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const prevResetKeyRef = useRef<number | undefined>(resetKey);
    const isRunningRef = useRef(false);

    // 当 duration 变化时，重置时间
    useEffect(() => {
        if (initialTimeLeft === undefined) {
            setTimeLeft(duration);
        }
    }, [duration]);

    // 当 resetKey 变化时，重置时间
    useEffect(() => {
        if (resetKey !== prevResetKeyRef.current) {
            const resetTime = initialTimeLeft ? Math.min(initialTimeLeft, duration) : duration;
            setTimeLeft(resetTime);
            prevResetKeyRef.current = resetKey;
        }
    }, [resetKey, duration, initialTimeLeft]);

    // 计时器逻辑 - 简化版本，避免依赖timeLeft
    useEffect(() => {
        if (!isActive) {
            isRunningRef.current = false;
            return;
        }

        // 确保时间大于0才开始计时
        if (timeLeft <= 0) {
            isRunningRef.current = false;
            return;
        }

        isRunningRef.current = true;

        const timer = setInterval(() => {
            if (!isRunningRef.current) {
                clearInterval(timer);
                return;
            }

            setTimeLeft(prev => {
                if (prev <= 0.1) {
                    isRunningRef.current = false;
                    clearInterval(timer);
                    onTimeUp();
                    return 0;
                }
                return prev - 0.1;
            });
        }, 100);

        return () => {
            isRunningRef.current = false;
            clearInterval(timer);
        };
    }, [isActive, onTimeUp]);

    const progress = duration > 0 ? (timeLeft / duration) * 100 : 0;

    const addTime = useCallback((seconds: number) => {
        setTimeLeft(prev => Math.min(GAME_PARAMS.TIMER_LIMITS.GLOBAL_MAX, prev + seconds));
    }, []);

    return { timeLeft, progress, addTime };
}
