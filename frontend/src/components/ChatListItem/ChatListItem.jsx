import './styles.scss';

export const ChatListItem = ({chat, selectedIndex, index, handleClick}) => {
    const {id, companionName, lastMessage, messageDate} = chat;

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
                handleClick({index, id});
            }}
        >
            <div className='chat-list-item__avatar'>
                <img src='frontend/src/components/ChatListItem/ChatListItem' alt=''/>
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
