import {Link} from 'react-router';
import styles from './styles.module.scss';
import {useContext} from 'react';
import {AuthContext} from '../../context/AuthContext';
import {ChatContext} from '../../context/ChatContext';

export const Header = () => {
    const {userData, setUserData} = useContext(AuthContext);
    const {setChatsList, setMessagesList, setMessagesWarning} = useContext(ChatContext);

    return (
        <header className={styles.header}>
            <div className={styles['header__project-name']}>React Chat</div>
            {userData && <div className={styles['header__user-name']}>Добро пожаловать, {userData?.name}! </div>}

            <nav className={styles.header__nav}>
                {!userData && <Link to='/register'>Регистрация</Link>}
                {!userData && <Link to='/login'>Вход</Link>}
                {userData && <Link to='/' onClick={() => {
                    localStorage.removeItem('user');
                    setUserData(null);
                    setChatsList(null);
                    setMessagesList(null);
                    setMessagesWarning(null);
                }}>Выход</Link>}
            </nav>
        </header>
    );
};
