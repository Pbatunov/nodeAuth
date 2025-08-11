import './styles.scss';
import {useContext, useState} from 'react';
import {ChatContext} from '../../context/ChatContext';
import {AuthContext} from '../../context/AuthContext';
import {ReactComponent as SendIcon} from './images/send-icon.svg';

export const MessageBox = () => {
    const [currentMessageText, setCurrentMessageText] = useState('');
    const {currentChat, createMessage, messagesList, messagesWarning} = useContext(ChatContext);
    const {userData} = useContext(AuthContext);
    const {id: senderId} = userData;

    if (!messagesList && !messagesWarning) {
        return null;
    }

    return (
        <div className='message-box'>
            <div className='message-box__list'>
                {!messagesList?.length ?
                    <div className='message-box__warning'>{messagesWarning}</div> :
                    messagesList?.map((item) => {

                        const {id, senderId, message} = item;
                        return <div key={id}
                            className={`message-box__message-item ${senderId === userData.id ? 'right' : ''}`}>{message}</div>;
                    })}
            </div>

            <form className='message-box__input-wrapper'>
                <input
                    type='text'
                    id='text'
                    className='message-box__input'
                    autoComplete='off'
                    value={currentMessageText}
                    onChange={(event) => {

                        const {value} = event.target;
                        setCurrentMessageText(value);
                    }}
                />

                <button
                    type='submit'
                    className='message-box__send'
                    onClick={(event) => {
                        createMessage({
                            event,
                            chatId: currentChat.id,
                            senderId,
                            message: currentMessageText,
                        });

                        setCurrentMessageText('');
                    }}
                >
                    <SendIcon/>
                </button>
            </form>
        </div>
    );
};
