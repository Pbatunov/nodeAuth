import './styles.scss';
import {useContext, useState} from 'react';
import {ChatContext} from '../../context/ChatContext';
import {getRequest} from '../../utils/get-request';

export const NewChat = ({onClose}) => {
    const {startChat} = useContext(ChatContext);

    const [search, setSearch] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [message, setMessage] = useState(null);

    // Ищем только по точному нику. Список всех пользователей не загружаем.
    const handleSearch = async (event) => {
        event.preventDefault();

        const login = search.trim();

        setFoundUser(null);
        setMessage(null);

        if (!login) {
            setMessage('Введите ник');
            return;
        }

        const result = await getRequest({url: `users/search?login=${encodeURIComponent(login)}`});

        if (result === null) {
            setMessage('Не удалось выполнить поиск');
            return;
        }

        if (!result.id) {
            setMessage('Пользователь не найден');
            return;
        }

        setFoundUser(result);
    };

    const handleSelect = async () => {
        const response = await startChat({companion: foundUser});

        if (response?.message && !response?.success) {
            setMessage(response.message);
            return;
        }

        onClose();
    };

    return (
        <div className='new-chat'>
            <form className='new-chat__form' onSubmit={handleSearch}>
                <input
                    type='text'
                    className='new-chat__search'
                    placeholder='Поиск пользователя (по nickname)'
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
                <button type='submit' className='new-chat__submit'>
                    Найти
                </button>
            </form>

            {message && <div className='new-chat__message'>{message}</div>}

            {foundUser && (
                <div className='new-chat__users'>
                    <button type='button' className='new-chat__user' onClick={handleSelect}>
                        {foundUser.name} <span className='new-chat__login'>@{foundUser.login}</span>
                    </button>
                </div>
            )}
        </div>
    );
};
