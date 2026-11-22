import {Link, useNavigate} from 'react-router';
import styles from './styles.module.scss';
import {useContext} from 'react';
import {AuthContext} from '../../context/AuthContext';
import {ChatContext} from '../../context/ChatContext';
import {postRequest} from '../../utils/post-request';
import {API_URL} from '../../config';
import {Avatar} from '../Avatar/Avatar';
import {AvatarUpload} from '../AvatarUpload/AvatarUpload';

export const Header = () => {
    const {userData, setUserData} = useContext(AuthContext);
    const {currentChat, setCurrentChat, setChatsList, setMessagesList, setMessagesWarning} = useContext(ChatContext);
    const navigate = useNavigate();

    return (
        <header className={styles.header}>
            <div className={styles['header__project-name']}>React Chat</div>
            {currentChat && (
                <button
                    type='button'
                    className={styles.header__back}
                    // Чат открыт по адресу /chat/:id, поэтому возврат — это переход на главную
                    onClick={() => navigate('/')}
                >
                    ←
                </button>
            )}
            {currentChat ? (
                // Открыт чат — показываем собеседника вместо себя
                <div className={styles['header__user-name']}>
                    <Avatar
                        name={currentChat.companionName}
                        userId={currentChat.companionId}
                        src={currentChat.companionAvatar ? `${API_URL}${currentChat.companionAvatar}` : null}
                        size={32}
                    />
                    <span>{currentChat.companionName}</span>
                </div>
            ) : userData && (
                <div className={styles['header__user-name']}>
                    <AvatarUpload/>
                    <span>{userData?.name}</span>
                </div>
            )}

            <nav className={styles.header__nav}>
                {!userData && <Link to='/register'>Регистрация</Link>}
                {!userData && <Link to='/login'>Вход</Link>}
                {userData && <Link to='/' onClick={() => {
                    // Сессия удаляется на сервере, cookie очищается им же.
                    postRequest({url: 'users/logout', data: {}});
                    setUserData(null);
                    setChatsList(null);
                    setCurrentChat(null);
                    setMessagesList(null);
                    setMessagesWarning(null);
                }}>Выход</Link>}
            </nav>
        </header>
    );
};
