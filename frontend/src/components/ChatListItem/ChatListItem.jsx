import './styles.scss';
import {useContext, useEffect, useRef, useState} from 'react';
import {ChatContext} from '../../context/ChatContext';
import {Avatar} from '../Avatar/Avatar';

export const ChatListItem = ({chat, isActive, unreadCount, handleClick}) => {
    const {
        id,
        companionName,
        companionId,
        lastMessage,
        messageDate,
    } = chat;

    const {onlineUsers, deleteChat} = useContext(ChatContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const actionsRef = useRef(null);

    // Закрываем меню по клику вне его и по Escape.
    useEffect(() => {
        if (!isMenuOpen) {
            return;
        }

        const handleMouseDown = (event) => {
            if (!actionsRef.current?.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMenuOpen]);

    const isOnline = onlineUsers?.some((user) => user.userId === companionId);
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('ru', {
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        }).format(new Date(date));
    };

    const handleDelete = async (event) => {
        event.stopPropagation();
        setIsMenuOpen(false);

        if (!window.confirm(`Удалить чат с ${companionName}? Все сообщения будут удалены без возможности восстановления.`)) {
            return;
        }

        const response = await deleteChat({chat});

        if (!response?.success) {
            window.alert(response?.message || 'Не удалось удалить чат');
        }
    };

    return (
        <div
            key={id}
            role='button'
            tabIndex={0}
            className={`chat-list-item ${isActive ? 'active' : ''}`}
            onClick={() => {
                handleClick({chat});
            }}
            onKeyDown={(event) => {
                // Enter/Space на вложенных кнопках не должны открывать чат.
                if (event.target !== event.currentTarget) {
                    return;
                }

                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleClick({chat});
                }
            }}
        >
            <div className='chat-list-item__avatar'>
                <Avatar name={companionName} userId={companionId} size={50}/>
                {isOnline ? <div className='chat-list-item__online'></div> : ''}
            </div>
            <div className='chat-list-item__text'>
                <div className='chat-list-item__name'>{companionName}</div>
                {lastMessage && <div className='chat-list-item__message'>{lastMessage}</div>}
            </div>
            {lastMessage && <div className='chat-list-item__meta'>
                <div className='chat-list-item__time'>{formatDate(messageDate)}</div>
                {unreadCount > 0 && <div className='chat-list-item__notification'>{unreadCount}</div>}
            </div>}

            <div className='chat-list-item__actions' ref={actionsRef}>
                <button
                    type='button'
                    className='chat-list-item__menu-button'
                    aria-label={`Действия с чатом ${companionName}`}
                    aria-haspopup='menu'
                    aria-expanded={isMenuOpen}
                    onClick={(event) => {
                        event.stopPropagation();
                        setIsMenuOpen((prev) => !prev);
                    }}
                >
                    ⋮
                </button>

                {isMenuOpen && (
                    <div
                        className='chat-list-item__menu'
                        role='menu'
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type='button'
                            role='menuitem'
                            className='chat-list-item__menu-item chat-list-item__menu-item--danger'
                            onClick={handleDelete}
                        >
                            Удалить чат
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
