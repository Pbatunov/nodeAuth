import {getRequest} from '../../utils/get-request';
import {postRequest} from '../../utils/post-request';
import {deleteRequest} from '../../utils/delete-request';

// Действия над чатами: открыть личный чат (или создать) и удалить чат.
export const useChatActions = ({user, chatsList, setChatsList, currentChat, getChatMessages, clearOpenChat}) => {
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
            clearOpenChat();
        }

        return response;
    };

    return {startChat, deleteChat};
};
