import {API_URL} from '../../config';

export const postRequest = async ({url, data}) => {
    const baseUrl = `${API_URL}/api/`;

    try {
        const response = await fetch(`${baseUrl}${url}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            return {
                message: `${response.status} - ${response.statusText}`,
            };
        }

        return await response.json();
    } catch (error) {
        console.log(error);
        return null;
    }
};
