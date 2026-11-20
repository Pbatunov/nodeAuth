import './styles.scss';
import {ChatListItem} from '../ChatListItem';
import {NewChat} from '../NewChat';
import {useContext, useState} from 'react';
import {ChatContext} from '../../context/ChatContext';

export const ChatsList = () => {
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);

    const {chatsList, currentChat, getChatMessages, unreadCounts} = useContext(ChatContext);

    if (!chatsList) {
        return null;
    }

    // Чаты с самым свежим сообщением — наверху. Чаты без сообщений уходят вниз.
    const getActivityTime = (chat) => new Date(chat.messageDate).getTime() || 0;
    const sortedChatsList = [...chatsList].sort((a, b) => getActivityTime(b) - getActivityTime(a));

    const handleClick = ({chat}) => {
        if (currentChat?.id === chat.id) {
            return;
        }

        getChatMessages({chat});
    };

    return (
        <div className='chats-list'>
            <button
                type='button'
                className='chats-list__new-chat'
                onClick={() => setIsNewChatOpen((prev) => !prev)}
            >
                {isNewChatOpen ? 'Отмена' : '+ Новый чат'}
            </button>

            {isNewChatOpen && <NewChat onClose={() => setIsNewChatOpen(false)}/>}

            {sortedChatsList.map((chat) => {
                return (
                    <ChatListItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === currentChat?.id}
                        unreadCount={unreadCounts?.[chat.id] || 0}
                        handleClick={handleClick}
                    />
                );
            })}
        </div>
    );
};
