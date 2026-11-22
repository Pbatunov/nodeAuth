import {useEffect} from 'react';
import {getRequest} from '../../utils/get-request';

// Входящие события сокета: новое сообщение и удаление чата собеседником.
export const useIncomingMessages = ({
    socket,
    user,
    chatsList,
    setChatsList,
    currentChat,
    setMessagesList,
    refreshChatMessages,
    incrementUnread,
    clearOpenChat,
}) => {
    useEffect(() => {
        if (!socket) {
            return;
        }

        if (!user) {
            return;
        }

        socket.on('getMessage', (message) => {
            // Обновляем последнее сообщение в списке чатов, даже если чат не открыт.
            setChatsList((prev) => prev?.map((chat) => (
                chat.id === message.chatId
                    ? {...chat, lastMessage: message.message, messageDate: message.createDate}
                    : chat
            )));

            // Чата ещё нет в списке (собеседник начал диалог) — подгружаем список с сервера.
            if (chatsList && !chatsList.some((chat) => chat.id === message.chatId)) {
                getRequest({url: `chats/${user.id}`}).then((list) => {
                    if (Array.isArray(list)) {
                        setChatsList(list);
                    }
                });
            }

            if (message.chatId !== currentChat?.id) {
                incrementUnread(message.chatId);
                return;
            }

            // Сразу показываем сообщение, затем сверяем список с БД.
            setMessagesList((prev) => {
                const list = Array.isArray(prev) ? prev : [];
                return list.some((item) => item.id === message.id) ? list : [...list, message];
            });
            refreshChatMessages({chatId: message.chatId});
        });

        // Собеседник удалил чат: убираем его у себя и очищаем окно, если оно открыто.
        socket.on('chatDeleted', ({chatId}) => {
            setChatsList((prev) => prev?.filter((chat) => chat.id !== chatId));

            if (currentChat?.id === chatId) {
                clearOpenChat();
            }
        });

        return () => {
            socket.off('getMessage');
            socket.off('chatDeleted');
        };
    }, [
        socket,
        currentChat,
        user,
        chatsList,
        setChatsList,
        setMessagesList,
        refreshChatMessages,
        incrementUnread,
        clearOpenChat,
    ]);
};
