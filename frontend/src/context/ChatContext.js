import {createContext, useEffect, useState} from 'react';
import {getRequest} from '../utils/get-request';
import {postRequest} from '../utils/post-request';
import {deleteRequest} from '../utils/delete-request';
import {io} from 'socket.io-client';

export const ChatContext = createContext();

export const ChatContextProvider = ({children, user}) => {
    const [chatsList, setChatsList] = useState(null);
    const [messagesList, setMessagesList] = useState(null);
    const [newMessage, setNewMessage] = useState(null);
    const [messagesWarning, setMessagesWarning] = useState(null);
    const [currentChat, setCurrentChat] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(null);
    // Непрочитанные сообщения по chatId. Хранятся в памяти текущей сессии.
    const [unreadCounts, setUnreadCounts] = useState({});

    useEffect(() => {
        const getChatsList = async () => {
            const {id: userId} = user;
            const chatsList = await getRequest({url: `chats/${userId}`});

            // Сервер может вернуть ошибку или объект вместо массива — тогда список пустой.
            setChatsList(Array.isArray(chatsList) ? chatsList : []);

            /*if (!messagesList?.length) {
                return null;
            }*/
        };

        if (user) {
            getChatsList();
        }
    }, [user, messagesList]
    );

    const getChatMessages = async ({chat}) => {
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
        setUnreadCounts((prev) => ({...prev, [chat.id]: 0}));
    };

    // Тихо обновляет сообщения открытого чата. При ошибке список не трогаем.
    const refreshChatMessages = async ({chatId}) => {
        const chatMessagesList = await getRequest({url: `messages/${chatId}`});

        if (Array.isArray(chatMessagesList)) {
            setMessagesList(chatMessagesList);
        }
    };

    // Открывает личный чат с пользователем: если чат уже есть — открывает его, иначе создаёт.
    const startChat = async ({companion}) => {
        const existingChat = chatsList?.find((chat) => chat.companionId === companion.id);

        if (existingChat) {
            return getChatMessages({chat: existingChat});
        }

        const response = await postRequest({
            url: 'chats',
            data: {firstId: user.id, secondId: companion.id},
        });

        if (!response?.success) {
            return response;
        }

        const updatedChatsList = await getRequest({url: `chats/${user.id}`});

        if (!Array.isArray(updatedChatsList)) {
            return;
        }

        setChatsList(updatedChatsList);

        const newChat = updatedChatsList.find((chat) => chat.companionId === companion.id);

        if (newChat) {
            await getChatMessages({chat: newChat});
        }
    };

    // Удаляет чат на сервере и убирает его из списка. Если чат был открыт — очищает окно сообщений.
    const deleteChat = async ({chat}) => {
        const response = await deleteRequest({
            url: `chats/${chat.id}`,
            data: {userId: user.id},
        });

        if (!response?.success) {
            return response;
        }

        setChatsList((prev) => prev?.filter((item) => item.id !== chat.id));

        if (currentChat?.id === chat.id) {
            setCurrentChat(null);
            setMessagesList(null);
            setMessagesWarning(null);
        }

        return response;
    };

    const createMessage = async ({event, chatId, senderId, message}) => {
        event.preventDefault();

        if (!message) {
            return;
        }

        const response = await postRequest({
            url: 'messages',
            data: {chatId, senderId, message},
        });

        const {companionId} = currentChat;

        setNewMessage({...response[response?.length - 1], companionId});
        setMessagesList(response);
    };

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        if (!user) {
            return;
        }

        const {id: userId} = user;

        socket.emit('userConnect', userId);

        socket.on('getOnlineUsers', (users) => {

            setOnlineUsers(users);
        });

        return () => {
            socket.off('getOnlineUsers');
        };
    }, [socket, user]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        if (!user) {
            return;
        }

        socket.emit('sendMessage', {...newMessage});

    }, [newMessage, socket, user]);

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
                setUnreadCounts((prev) => ({
                    ...prev,
                    [message.chatId]: (prev[message.chatId] || 0) + 1,
                }));
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
                setCurrentChat(null);
                setMessagesList(null);
                setMessagesWarning(null);
            }
        });

        return () => {
            socket.off('getMessage');
            socket.off('chatDeleted');
        };

    }, [socket, currentChat, user, chatsList]);


    return (
        <ChatContext.Provider value={{
            chatsList,
            currentChat,
            setChatsList,
            createMessage,
            getChatMessages,
            startChat,
            deleteChat,
            messagesList,
            messagesWarning,
            setMessagesList,
            setMessagesWarning,
            socket,
            onlineUsers,
            unreadCounts,
        }}>
            {children}
        </ChatContext.Provider>
    );
};
