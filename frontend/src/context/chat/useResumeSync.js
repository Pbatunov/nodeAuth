import {useEffect} from 'react';

// При возврате на вкладку (разблокировка телефона) переподключаем сокет и подгружаем открытый чат,
// чтобы сообщения, пришедшие пока экран был заблокирован, появились без обновления страницы.
export const useResumeSync = ({socket, user, currentChat, refreshChatMessages}) => {
    useEffect(() => {
        if (!socket || !user) {
            return;
        }

        const syncOnResume = () => {
            if (document.visibilityState !== 'visible') {
                return;
            }

            if (!socket.connected) {
                socket.connect();
            }

            if (currentChat) {
                refreshChatMessages({chatId: currentChat.id});
            }
        };

        socket.on('connect', syncOnResume);
        document.addEventListener('visibilitychange', syncOnResume);

        return () => {
            socket.off('connect', syncOnResume);
            document.removeEventListener('visibilitychange', syncOnResume);
        };
    }, [socket, user, currentChat, refreshChatMessages]);
};
