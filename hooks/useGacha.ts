import { useState, useCallback } from 'react';
import { StorageItem, ItemType, GachaResult, GachaItemResult, GachaEventResult } from '../types';
import { generateRandomId, GACHA_NARRATIVES, GACHA_EVENTS, GACHA_ITEM_POOL, GACHA_CONFIG } from '../gameConfig';

export function useGacha() {
    const [isOpen, setIsOpen] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawResult, setDrawResult] = useState<GachaResult | null>(null);
    const [isNewDiscovery, setIsNewDiscovery] = useState(false);

    // 随机获取道具
    const getRandomItem = (): StorageItem => {
        const type = GACHA_ITEM_POOL[Math.floor(Math.random() * GACHA_ITEM_POOL.length)];
        return {
            id: generateRandomId(),
            type,
            value: type === 'number' ? Math.floor(Math.random() * 9) + 1 : undefined
        };
    };

    // 随机获取事件
    const getRandomEvent = (): GachaEventResult => {
        const event = GACHA_EVENTS[Math.floor(Math.random() * GACHA_EVENTS.length)];
        return {
            type: 'event',
            resultType: 'event',
            eventId: event.id as any,
            eventText: event.text
        };
    };

    // 随机获取道具文案组合
    const getRandomItemNarrative = (item: StorageItem): { narrative: string; itemName: string } => {
        const intro = GACHA_NARRATIVES.ITEM_INTROS[Math.floor(Math.random() * GACHA_NARRATIVES.ITEM_INTROS.length)];
        const itemName = GACHA_NARRATIVES.ITEM_NAMES[item.type] || item.type;
        return { narrative: intro, itemName };
    };

    const performDraw = useCallback((onResult: (result: GachaResult) => void) => {
        setIsDrawing(true);

        setTimeout(() => {
            // 根据配置概率决定获得道具还是发生事件
            const isItem = Math.random() < GACHA_CONFIG.ITEM_CHANCE;
            let result: GachaResult;

            if (isItem) {
                // 获得道具
                const item = getRandomItem();
                const { narrative: narrativeText, itemName } = getRandomItemNarrative(item);

                // 检查是否是首次发现
                const storageKey = `seen_item_${item.type}`;
                const hasSeen = localStorage.getItem(storageKey);
                if (!hasSeen) {
                    setIsNewDiscovery(true);
                    localStorage.setItem(storageKey, 'true');
                } else {
                    setIsNewDiscovery(false);
                }

                result = {
                    type: 'item',
                    resultType: 'item',
                    item,
                    narrativeText,
                    itemName
                } as GachaItemResult;
            } else {
                // 发生事件
                setIsNewDiscovery(false);
                result = getRandomEvent();
            }

            onResult(result);
            setDrawResult(result);
            setIsDrawing(false);
        }, 800);
    }, []);

    const claimReward = useCallback(() => {
        setIsOpen(false);
        setDrawResult(null);
        setIsNewDiscovery(false);
    }, []);

    return { isOpen, setIsOpen, isDrawing, drawResult, isNewDiscovery, performDraw, claimReward };
}
