import {Link} from "react-router";
import styles from "./styles.module.scss";
import {useContext} from "react";
import {AuthContext} from "../../context/AuthContext";

export const Header = () => {
    const {setUserData,userData, logoutUser} = useContext(AuthContext);

    return (
        <header className={styles.header}>
            <div className={styles['header__project-name']}>React Chat</div>
            {userData && <div className={styles['header__user-name']}>Добро пожаловать, {userData?.name}! </div>}

            <nav className={styles['header__nav']}>
                {!userData && <Link to='/register'>Регистрация</Link>}
                {!userData && <Link to='/login'>Вход</Link>}
                {userData && <Link to='/' onClick={()=>{
                    localStorage.removeItem('user');
                    setUserData(null);
                }}>Выход</Link>}
            </nav>
        </header>
    );
}
