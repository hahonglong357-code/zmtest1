import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export function useLeaderboard() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLeaderboard = useCallback(async () => {
        console.log('Fetching leaderboard...');
        try {
            const { data, error: fetchError } = await supabase
                .from('high_scores')
                .select('*')
                .order('score', { ascending: false })
                .limit(500);

            console.log('Leaderboard data:', data);
            console.log('Leaderboard error:', fetchError);

            if (fetchError) {
                setError(fetchError.message);
            } else {
                setError(null);
            }

            if (!fetchError && data) setLeaderboard(data);
        } catch (e: any) {
            console.error('Fetch error:', e);
            setError(e.message);
        }
    }, []);

    const MAX_ENTRIES = 500;

    const submitScore = useCallback(async (username: string, score: number) => {
        console.log('Submitting score:', username, score);
        if (!username.trim() || score <= 0) {
            console.log('Early return - invalid username or score');
            return;
        }
        localStorage.setItem('last_username', username.trim());

        // 直接插入分数
        const { error: insertError } = await supabase
            .from('high_scores')
            .insert([{ username, score }]);

        if (insertError) {
            console.error('Insert error:', insertError);
            setError(insertError.message);
        } else {
            console.log('Score inserted successfully');
        }

        // 刷新排行榜
        await fetchLeaderboard();
    }, [fetchLeaderboard]);

    useEffect(() => { fetchLeaderboard(); }, []);

    return { leaderboard, showLeaderboard, setShowLeaderboard, fetchLeaderboard, submitScore, error };
}
