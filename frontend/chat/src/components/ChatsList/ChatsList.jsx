import './styles.scss'
import {ChatListItem} from "../ChatListItem";

export const ChatsList = () => {
    return (
        <div className="chats-list">
            <ChatListItem/>
            <ChatListItem isActive={true}/>
            <ChatListItem/>
        </div>
    )
}
