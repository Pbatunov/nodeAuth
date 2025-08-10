import {createContext, useEffect, useState} from 'react';
import {getRequest} from '../utils/get-request';
import {postRequest} from '../utils/post-request';

export const ChatContext = createContext();

export const ChatContextProvider = ({children, user}) => {
    const [chatsList, setChatsList] = useState(null);
    const [messagesList, setMessagesList] = useState(null);
    const [messagesWarning, setMessagesWarning] = useState(null);
    const [currentChatId, setCurrentChatId] = useState(null);

    useEffect(() => {
        const getChatsList = async () => {
            const {id: userId} = user;
            const chatsList = await getRequest({url: `chats/${userId}`});

            setChatsList(chatsList);

            if (!messagesList?.length) {
                return null;
            }
        };

        if (user) {
            getChatsList();
        }
    }, [messagesList, user]
    );

    const getChatMessages = async ({id}) => {
        const chatMessagesList = await getRequest({url: `messages/${id}`});
        setMessagesList(chatMessagesList);
        setMessagesWarning(chatMessagesList?.responseToFront?.message);
        setCurrentChatId(id);
    };

    const createMessage = ({event, chatId, senderId, message}) => {
        event.preventDefault();

        if (!message) {
            return;
        }

        postRequest({
            url: 'messages',
            data: {chatId, senderId, message},
        });
    };

    return (
        <ChatContext.Provider value={{
            chatsList,
            currentChatId,
            setChatsList,
            createMessage,
            getChatMessages,
            messagesList,
            messagesWarning,
            setMessagesList,
            setMessagesWarning,
        }}>
            {children}
        </ChatContext.Provider>
    );
};
