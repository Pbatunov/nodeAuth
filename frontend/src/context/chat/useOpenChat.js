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

    // Загружает сообщения чата и делает его открытым. Вызывается только из эффекта по адресу.
    const loadChat = useCallback(async ({chat}) => {
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
    }, [resetUnread, setMessagesList]);

    // Открытие чата идёт через адрес: если он меняется, эффект ниже сам загрузит чат.
    // Нельзя ставить currentChat напрямую — адрес обновляется позже (startTransition в react-router),
    // и эффект успевал вернуть предыдущий чат, из-за чего окно переключалось туда-сюда.
    const getChatMessages = useCallback(({chat}) => {
        if (String(chat.id) !== routeChatId) {
            navigate(`/chat/${chat.id}`);
            return;
        }

        // Адрес уже указывает на этот чат (повторный клик) — перезагружаем сообщения сразу.
        return loadChat({chat});
    }, [navigate, routeChatId, loadChat]);

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
            loadChat({chat: chatFromUrl});
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
