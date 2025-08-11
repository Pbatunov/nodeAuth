import './styles.scss';
import {useContext} from 'react';
import {ChatContext} from '../../context/ChatContext';

export const ChatListItem = ({chat, selectedIndex, index, handleClick}) => {
    const {
        id,
        companionName,
        companionId,
        lastMessage,
        messageDate,
    } = chat;

    const {onlineUsers} = useContext(ChatContext);


    const isOnline = onlineUsers?.some((user) => user.userId === companionId);
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('ru', {
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        }).format(new Date(date));
    };

    return (
        <button
            key={id}
            className={`chat-list-item ${index === selectedIndex ? 'active' : ''}`}
            onClick={() => {
                handleClick({index, chat});
            }}
        >
            <div className='chat-list-item__avatar'>
                <img src='frontend/src/components/ChatListItem/ChatListItem' alt=''/>
                {isOnline ? <div className='chat-list-item__online'></div> : ''}
            </div>
            <div className='chat-list-item__text'>
                <div className='chat-list-item__name'>{companionName}</div>
                {lastMessage && <div className='chat-list-item__message'>{lastMessage}</div>}
            </div>
            {lastMessage && <div className='chat-list-item__meta'>
                <div className='chat-list-item__time'>{formatDate(messageDate)}</div>
                <div className='chat-list-item__notification'>5</div>
            </div>}
        </button>
    );
};
