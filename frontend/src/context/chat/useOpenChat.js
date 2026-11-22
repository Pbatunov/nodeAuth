import {useCallback, useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {getRequest} from '../../utils/get-request';

// Открытый чат: загрузка его сообщений и синхронизация с адресом /chat/:chatId.
// Сам список сообщений (messagesList) хранится в ChatContextProvider, сюда передаётся его сеттер.
export const useOpenChat = ({user, chatsList, setMessagesList, resetUnread}) => {
    const [currentChat, setCurrentChat] = useState(null);
    const [messagesWarning, setMessagesWarning] = useState(null);

    const navigate = useNavigate();
    const {pathname} = useLocation();
    // ID открытого чата хранится в адресе (/chat/:chatId), поэтому он переживает перезагрузку страницы.
    const routeChatId = pathname.match(/^\/chat\/([^/]+)$/)?.[1] ?? null;

    // Загружает сообщения чата и делает его открытым. syncUrl — обновить адрес на /chat/:chatId.
    const loadChat = useCallback(async ({chat, syncUrl}) => {
        const chatMessagesList = await getRequest({url: `messages/${chat.id}`});

        if (Array.isArray(chatMessagesList)) {
            setMessagesList(chatMessagesList);
            setMessagesWarning(null);
        } else if (chatMessagesList?.responseToFront) {
            // Пустой чат: сервер присылает объект с сообщением, а не массив.
            setMessagesList([]);
            setMessagesWarning(chatMessagesList.responseToFront.message);
        } else {
            // Ошибка запроса (например, 503 при недоступной БД).
            setMessagesList([]);
            setMessagesWarning(chatMessagesList?.message || 'Не удалось загрузить сообщения');
        }

        setCurrentChat(chat);
        resetUnread(chat.id);

        // navigate вызывается в той же задаче, что и setCurrentChat, поэтому React обновит их одним рендером.
        if (syncUrl) {
            navigate(`/chat/${chat.id}`);
        }
    }, [navigate, resetUnread, setMessagesList]);

    const getChatMessages = useCallback(({chat}) => loadChat({chat, syncUrl: true}), [loadChat]);

    // Закрывает открытый чат и очищает окно сообщений.
    const clearOpenChat = useCallback(() => {
        setCurrentChat(null);
        setMessagesList(null);
        setMessagesWarning(null);
    }, [setMessagesList]);

    // Тихо обновляет сообщения чата. При ошибке список не трогаем.
    const refreshChatMessages = useCallback(async ({chatId}) => {
        const chatMessagesList = await getRequest({url: `messages/${chatId}`});

        if (Array.isArray(chatMessagesList)) {
            setMessagesList(chatMessagesList);
        }
    }, [setMessagesList]);

    // После перезагрузки страницы открываем чат из адреса, когда список чатов загружен.
    useEffect(() => {
        if (!user || !Array.isArray(chatsList) || !routeChatId) {
            return;
        }

        if (currentChat && String(currentChat.id) === routeChatId) {
            return;
        }

        const chatFromUrl = chatsList.find((chat) => String(chat.id) === routeChatId);

        if (chatFromUrl) {
            loadChat({chat: chatFromUrl, syncUrl: false});
        } else {
            // Чата нет (удалён или недоступен) — возвращаемся на главную.
            navigate('/', {replace: true});
        }
    }, [user, chatsList, routeChatId, currentChat, loadChat, navigate]);

    // Адрес больше не указывает на чат (кнопка «назад» браузера, возврат к списку) — закрываем открытый чат.
    useEffect(() => {
        if (!routeChatId && currentChat) {
            clearOpenChat();
        }
    }, [routeChatId, currentChat, clearOpenChat]);

    return {
        currentChat,
        setCurrentChat,
        messagesWarning,
        setMessagesWarning,
        getChatMessages,
        clearOpenChat,
        refreshChatMessages,
    };
};
