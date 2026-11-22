import './styles.scss';

// Дата и время сообщения: «22.11.2026, 14:05».
const formatDate = (date) => {
    if (!date) {
        return '';
    }

    return new Intl.DateTimeFormat('ru', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
};

export const MessageItem = ({message, createDate, isOwn}) => (
    <div className={`message-item ${isOwn ? 'message-item--own' : ''}`}>
        <div className='message-item__text'>{message}</div>
        <div className='message-item__meta'>
            <time className='message-item__time'>{formatDate(createDate)}</time>
        </div>
    </div>
);
