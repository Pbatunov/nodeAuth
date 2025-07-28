import './styles.scss'
import {useContext} from "react";
import {ChatContext} from "../../context/ChatContext";
import {ReactComponent as SendIcon} from './images/send-icon.svg'

export const MessageBox = () => {
    const {messagesList, messagesWarning} = useContext(ChatContext)

    if (!messagesList && !messagesWarning) {
        return null
    }

    return (
        <div className="message-box">
            <div className="message-box__list">
                {!messagesList?.length ?
                    <div class="message-box__warning">{messagesWarning}</div> :
                    messagesList?.map((item) => {
                        const {message} = item;
                        return <div className="message-box__message-item">{message}</div>
                    })}
            </div>

            <div className="message-box__input-wrapper">
                <input type="text" className="message-box__input"/>

                <div className="message-box__send">
                    <SendIcon/>
                </div>
            </div>
        </div>
    )
}
