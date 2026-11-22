import {useCallback, useState} from 'react';

// Непрочитанные сообщения по chatId. Хранятся в памяти текущей сессии.
export const useUnreadCounts = () => {
    const [unreadCounts, setUnreadCounts] = useState({});

    const resetUnread = useCallback((chatId) => {
        setUnreadCounts((prev) => ({...prev, [chatId]: 0}));
    }, []);

    const incrementUnread = useCallback((chatId) => {
        setUnreadCounts((prev) => ({...prev, [chatId]: (prev[chatId] || 0) + 1}));
    }, []);

    return {unreadCounts, resetUnread, incrementUnread};
};
