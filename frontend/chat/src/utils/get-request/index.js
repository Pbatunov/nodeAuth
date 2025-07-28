export const getRequest = async ({url}) => {

    const baseUrl = 'http://localhost:5000/api/'

    try {
        const response = await fetch(`${baseUrl}${url}`)

        if (!response.ok) {
            return {
                message: `${response.status} - ${response.statusText}`
            }
        }

        return await response.json();
    } catch (error) {
        console.log(error);
        return null;
    }
}
