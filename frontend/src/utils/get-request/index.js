import {API_URL} from '../../config';

export const getRequest = async ({url}) => {

    const baseUrl = `${API_URL}/api/`;

    try {
        const response = await fetch(`${baseUrl}${url}`);

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
