import './styles.scss';
import {useContext, useEffect, useState} from 'react';
import {ChatContext} from '../../context/ChatContext';
import {AuthContext} from '../../context/AuthContext';
import {getRequest} from '../../utils/get-request';

export const NewChat = ({onClose}) => {
    const {userData} = useContext(AuthContext);
    const {startChat} = useContext(ChatContext);

    const [users, setUsers] = useState(null);
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const loadUsers = async () => {
            const allUsers = await getRequest({url: 'users'});

            if (!Array.isArray(allUsers)) {
                setMessage('Не удалось загрузить пользователей');
                return;
            }

            setUsers(allUsers.filter((user) => user.id !== userData.id));
        };

        loadUsers();
    }, [userData.id]);

    const handleSelect = async (companion) => {
        const response = await startChat({companion});

        if (response?.message && !response?.success) {
            setMessage(response.message);
            return;
        }

        onClose();
    };

    const visibleUsers = (users || []).filter((user) =>
        user.name.toLowerCase().includes(search.trim().toLowerCase())
    );

    return (
        <div className='new-chat'>
            <input
                type='text'
                className='new-chat__search'
                placeholder='Поиск пользователя'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
            />

            {message && <div className='new-chat__message'>{message}</div>}

            <div className='new-chat__users'>
                {users && !visibleUsers.length && <div className='new-chat__empty'>Никого не найдено</div>}

                {visibleUsers.map((user) => (
                    <button
                        key={user.id}
                        type='button'
                        className='new-chat__user'
                        onClick={() => handleSelect(user)}
                    >
                        {user.name}
                    </button>
                ))}
            </div>
        </div>
    );
};
