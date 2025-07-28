import './styles.scss'
import {useContext} from "react";
import {ChatContext} from "../../context/ChatContext";

export const ChatListItem = ({chat, selectedIndex, index, handleClick}) => {
    const {id, companionName} = chat;

    return (
        <button
            className={`chat-list-item ${index === selectedIndex ? 'active' : ''}`}
            onClick={() => {
                handleClick({index, id})
            }}
        >
            <div className="chat-list-item__avatar">
                <img src="" alt=""/>
            </div>
            <div className="chat-list-item__text">
                <div className="chat-list-item__name">{companionName}</div>
                <div className="chat-list-item__message">Привет</div>
            </div>
            <div className="chat-list-item__meta">
                <div className="chat-list-item__time">12:45</div>
                <div className="chat-list-item__notification">5</div>
            </div>
        </button>
    )
}
