import {useContext, useRef, useState} from 'react';
import {Avatar} from '../Avatar/Avatar';
import {AuthContext} from '../../context/AuthContext';
import {uploadAvatar} from '../../utils/upload-avatar';
import {API_URL} from '../../config';
import './styles.scss';

// Лимит совпадает с серверным. Проверка на клиенте нужна только для быстрого ответа.
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp';

export const AvatarUpload = () => {
    const {userData, setUserData} = useContext(AuthContext);
    const inputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleChange = async (event) => {
        const file = event.target.files?.[0];

        // Сбрасываем значение, чтобы можно было снова выбрать тот же файл.
        event.target.value = '';

        if (!file) {
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            window.alert('Файл больше 2 МБ');
            return;
        }

        setIsUploading(true);
        const response = await uploadAvatar({file});
        setIsUploading(false);

        if (!response?.success) {
            window.alert(response?.message || 'Не удалось загрузить аватар');
            return;
        }

        setUserData((prev) => ({...prev, avatar: response.avatar}));
    };

    return (
        <>
            <button
                type='button'
                className='avatar-upload'
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                aria-label='Сменить аватар'
                title='Сменить аватар'
            >
                <Avatar
                    name={userData.name}
                    userId={userData.id}
                    src={userData.avatar ? `${API_URL}${userData.avatar}` : null}
                    size={32}
                />
            </button>
            <input
                ref={inputRef}
                type='file'
                accept={ACCEPT}
                hidden
                onChange={handleChange}
            />
        </>
    );
};
