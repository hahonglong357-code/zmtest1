import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export function useLeaderboard() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('high_scores')
                .select('*')
                .order('score', { ascending: false })
                .limit(10);
            if (!error && data) setLeaderboard(data);
        } catch (e) { console.error(e); }
    }, []);

    const MAX_ENTRIES = 500;

    const submitScore = useCallback(async (username: string, score: number) => {
        if (!username.trim() || score === 0) return;
        localStorage.setItem('last_username', username.trim());

        // 检查当前条目数量，限制为500
        const { count } = await supabase
            .from('high_scores')
            .select('*', { count: 'exact', head: true });

        if (count !== null && count >= MAX_ENTRIES) {
            // 获取当前最低分
            const { data: lowestScores } = await supabase
                .from('high_scores')
                .select('id, score')
                .order('score', { ascending: true })
                .limit(count - MAX_ENTRIES + 1);

            if (lowestScores && lowestScores.length > 0) {
                const lowestIds = lowestScores.map(s => s.id);
                // 删除最低分记录
                await supabase.from('high_scores').delete().in('id', lowestIds);
            }
        }

        await supabase.from('high_scores').insert([{ username, score }]);
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    useEffect(() => { fetchLeaderboard(); }, []);

    return { leaderboard, showLeaderboard, setShowLeaderboard, fetchLeaderboard, submitScore };
}
