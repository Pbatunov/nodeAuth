import {API_URL} from '../../config';

// Файл отправляем как multipart/form-data. Content-Type не задаём: браузер сам добавит границу частей.
export const uploadAvatar = async ({file}) => {
    const baseUrl = `${API_URL}/api/`;
    const formData = new FormData();

    formData.append('avatar', file);

    try {
        const response = await fetch(`${baseUrl}users/me/avatar`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            return {success: false, message: data?.message || 'Не удалось загрузить аватар'};
        }

        return data;
    } catch (error) {
        console.log(error);
        return {success: false, message: 'Нет связи с сервером'};
    }
};
