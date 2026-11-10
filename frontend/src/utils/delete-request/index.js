export const deleteRequest = async ({url, data}) => {
    const baseUrl = 'http://localhost:5000/api/';

    try {
        const response = await fetch(`${baseUrl}${url}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'DELETE',
            body: JSON.stringify(data),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
            return {
                success: false,
                message: result?.message || `${response.status} - ${response.statusText}`,
            };
        }

        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
};
