import {createContext, useEffect, useState} from 'react';
import {getRequest} from '../utils/get-request';
import {postRequest} from '../utils/post-request';
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

    const getChatMessages = async ({chat}) => {
        const chatMessagesList = await getRequest({url: `messages/${chat.id}`});
        setMessagesList(chatMessagesList);
        setMessagesWarning(chatMessagesList?.responseToFront?.message);
        setCurrentChat(chat);
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
    }, [socket]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        if (!user) {
            return;
        }

        socket.emit('sendMessage', {...newMessage});

    }, [newMessage]);

    useEffect(() => {
        if (!socket) {
            return;
        }

        if (!user) {
            return;
        }

        socket.on('getMessage', (message) => {

            if (message.chatId !== currentChat.id) {
                return null;
            }

            console.log({message});

            setMessagesList((prev) => {
                console.log(prev);
                return prev.length ? [...prev, message] : [message];
            });

        });

        return () => {
            socket.off('getMessage');
        };

    }, [socket, currentChat]);


    return (
        <ChatContext.Provider value={{
            chatsList,
            currentChat,
            setChatsList,
            createMessage,
            getChatMessages,
            messagesList,
            messagesWarning,
            setMessagesList,
            setMessagesWarning,
            socket,
            onlineUsers,
        }}>
            {children}
        </ChatContext.Provider>
    );
};
