import {useEffect, useState} from 'react';
import {postRequest} from '../../utils/post-request';

// Отправка сообщения: сохраняет его на сервере и сообщает собеседнику через сокет.
export const useSendMessage = ({socket, user, currentChat, setMessagesList}) => {
    const [newMessage, setNewMessage] = useState(null);

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
        if (!socket) {
            return;
        }

        if (!user) {
            return;
        }

        socket.emit('sendMessage', {...newMessage});

    }, [newMessage, socket, user]);

    return {createMessage};
};
