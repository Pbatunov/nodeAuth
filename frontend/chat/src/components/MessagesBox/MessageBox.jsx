import './styles.scss'
import {useContext, useState} from "react";
import {ChatContext} from "../../context/ChatContext";
import {ReactComponent as SendIcon} from './images/send-icon.svg'
import {AuthContext} from "../../context/AuthContext";

export const MessageBox = () => {
    const [currentMessageText, setCurrentMessageText] = useState('');
    const {currentChatId, createMessage, messagesList, messagesWarning} = useContext(ChatContext);
    const {userData} = useContext(AuthContext);
    const {id: senderId} = userData;

    if (!messagesList && !messagesWarning) {
        return null
    }

    return (
        <div className="message-box">
            <div className="message-box__list">
                {!messagesList?.length ?
                    <div className="message-box__warning">{messagesWarning}</div> :
                    messagesList?.map((item) => {

                        const {id, senderId, message} = item;
                        console.log({senderId, userId: userData.id});
                        return <div key={id}
                                    className={`message-box__message-item ${senderId === userData.id ? 'right' : ''}`}>{message}</div>
                    })}
            </div>

            <form className="message-box__input-wrapper">
                <input
                    type="text"
                    id="text"
                    className="message-box__input"
                    autoComplete="off"
                    value={currentMessageText}
                    onChange={(event) => {

                        const {value} = event.target
                        setCurrentMessageText(value)
                    }}
                />

                <button
                    type="submit"
                    className="message-box__send"
                    onClick={(event) => {
                        createMessage({
                            event,
                            chatId: currentChatId,
                            senderId,
                            message: currentMessageText,
                        })
                    }}
                >
                    <SendIcon/>
                </button>
            </form>
        </div>
    )
}
