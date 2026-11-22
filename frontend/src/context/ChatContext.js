import {createContext, useState} from 'react';
import {useChatsList} from './chat/useChatsList';
import {useUnreadCounts} from './chat/useUnreadCounts';
import {useOpenChat} from './chat/useOpenChat';
import {useChatActions} from './chat/useChatActions';
import {useChatSocket} from './chat/useChatSocket';
import {useResumeSync} from './chat/useResumeSync';
import {useIncomingMessages} from './chat/useIncomingMessages';
import {useSendMessage} from './chat/useSendMessage';

export const ChatContext = createContext();

// Провайдер только собирает хуки из папки ./chat. Логика каждого блока — в своём файле.
export const ChatContextProvider = ({children, user}) => {
    // Сообщения открытого чата живут здесь: от них зависит перезагрузка списка чатов (useChatsList).
    const [messagesList, setMessagesList] = useState(null);

    const {unreadCounts, resetUnread, incrementUnread} = useUnreadCounts();

    const {chatsList, setChatsList} = useChatsList({user, messagesList});

    const {
        currentChat,
        setCurrentChat,
        messagesWarning,
        setMessagesWarning,
        getChatMessages,
        clearOpenChat,
        refreshChatMessages,
    } = useOpenChat({user, chatsList, setMessagesList, resetUnread});

    const {startChat, deleteChat} = useChatActions({
        user,
        chatsList,
        setChatsList,
        currentChat,
        getChatMessages,
        clearOpenChat,
    });

    const {socket, onlineUsers} = useChatSocket({user});

    useResumeSync({socket, user, currentChat, refreshChatMessages});

    useIncomingMessages({
        socket,
        user,
        chatsList,
        setChatsList,
        currentChat,
        setMessagesList,
        refreshChatMessages,
        incrementUnread,
        clearOpenChat,
    });

    const {createMessage} = useSendMessage({socket, user, currentChat, setMessagesList});

    return (
        <ChatContext.Provider value={{
            chatsList,
            currentChat,
            setCurrentChat,
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
