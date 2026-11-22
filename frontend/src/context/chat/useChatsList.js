import {useEffect, useState} from 'react';
import {getRequest} from '../../utils/get-request';

// Список чатов пользователя. Перезагружается при смене пользователя и при каждом изменении сообщений:
// в списке отображается последнее сообщение, которое меняется вместе с messagesList.
export const useChatsList = ({user, messagesList}) => {
    const [chatsList, setChatsList] = useState(null);

    useEffect(() => {
        const getChatsList = async () => {
            const {id: userId} = user;
            const chatsList = await getRequest({url: `chats/${userId}`});

            // Сервер может вернуть ошибку или объект вместо массива — тогда список пустой.
            setChatsList(Array.isArray(chatsList) ? chatsList : []);
        };

        if (user) {
            getChatsList();
        }
    }, [user, messagesList]);

    return {chatsList, setChatsList};
};
