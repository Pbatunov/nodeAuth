import './styles.scss';
import {useContext, useRef, useState, useEffect} from 'react';
import {ChatContext} from '../../context/ChatContext';
import {AuthContext} from '../../context/AuthContext';
import {ReactComponent as SendIcon} from './images/send-icon.svg';

const EMOJIS = ['😀', '😂', '😍', '😎', '🥰', '😢', '😡', '👍', '👎', '🙏', '🔥', '🎉', '❤️', '😉', '🤔', '😴', '👋', '💯'];

export const MessageBox = () => {
    const [currentMessageText, setCurrentMessageText] = useState('');
    const [isEmojiPanelOpen, setIsEmojiPanelOpen] = useState(false);
    const {currentChat, createMessage, messagesList, messagesWarning} = useContext(ChatContext);
    const {userData} = useContext(AuthContext);
    const messagesListRef = useRef(null);
    const inputRef = useRef(null);
    const emojiPanelRef = useRef(null);
    const {id: senderId} = userData;


    useEffect(() => {
        if (messagesListRef?.current) {
            messagesListRef.current.scrollTo(0, 9999999);
        }
    });

    // Фокус на панели: при уходе фокуса за пределы формы панель закрывается (см. onBlur у формы)
    useEffect(() => {
        if (isEmojiPanelOpen) {
            emojiPanelRef.current?.focus();
        }
    }, [isEmojiPanelOpen]);

    if (!messagesList && !messagesWarning) {
        return null;
    }

    return (
        <div className={`message-box ${currentChat ? 'message-box--open' : ''}`}>
            <div className='message-box__list' ref={messagesListRef}>
                {!messagesList?.length ?
                    <div className='message-box__warning'>{messagesWarning}</div> :
                    messagesList?.map((item) => {

                        const {id, senderId, message} = item;
                        return <div key={id}
                            className={`message-box__message-item ${senderId === userData.id ? 'right' : ''}`}>{message}</div>;
                    })}
            </div>

            <form
                className='message-box__input-wrapper'
                onBlur={(event) => {
                    // Фокус ушёл за пределы формы — закрываем панель смайлов
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                        setIsEmojiPanelOpen(false);
                    }
                }}
            >
                {isEmojiPanelOpen &&
                    <div
                        ref={emojiPanelRef}
                        tabIndex={-1}
                        className='message-box__emoji-panel'
                        // preventDefault не даёт сбросить фокус при нажатии на панель (важно для Safari)
                        onMouseDown={(event) => event.preventDefault()}
                    >
                        {EMOJIS.map((emoji) => (
                            <button
                                key={emoji}
                                type='button'
                                className='message-box__emoji'
                                onClick={() => setCurrentMessageText((prev) => prev + emoji)}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                }

                <input
                    ref={inputRef}
                    type='text'
                    id='text'
                    className='message-box__input'
                    autoComplete='off'
                    value={currentMessageText}
                    placeholder={'Введите сообщение'}
                    onChange={(event) => {

                        const {value} = event.target;
                        setCurrentMessageText(value);
                    }}
                />

                <button
                    type='button'
                    className='message-box__emoji-toggle'
                    aria-label='Смайлы'
                    aria-expanded={isEmojiPanelOpen}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setIsEmojiPanelOpen((isOpen) => !isOpen)}
                >
                    😊
                </button>

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
                        setIsEmojiPanelOpen(false);
                    }}
                >
                    <SendIcon/>
                </button>
            </form>
        </div>
    );
};
