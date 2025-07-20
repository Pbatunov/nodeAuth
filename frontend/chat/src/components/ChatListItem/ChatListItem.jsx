import './styles.scss'

export const ChatListItem = ({isActive}) => {
    return (
        <div className={`chat-list-item ${isActive ? 'active': ''}`}>
            <div className="chat-list-item__avatar">
                <img src="" alt=""/>
            </div>
            <div className="chat-list-item__text">
                <div className="chat-list-item__name">Дарья</div>
                <div className="chat-list-item__message">Привет</div>
            </div>
            <div className="chat-list-item__meta">
                <div className="chat-list-item__time">12:45</div>
                <div className="chat-list-item__notification">5</div>
            </div>
        </div>
    )
}
