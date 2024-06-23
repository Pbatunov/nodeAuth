(() => {
    const regForm = document.querySelector('.js-reg-form');

    if (!regForm) {
        return;
    }

    const AJAX_URL = '/registration';

    const sendData = async (event) => {
        event.preventDefault();

        const regFormMessage = regForm.querySelector('.js-reg-form-message');
        const urlEncoded = new URLSearchParams(new FormData(regForm));

        try {
            const request = await fetch(AJAX_URL, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                method: 'POST',
                body: urlEncoded,
            });

            const response = await request.json();

            if (response.success) {
                location.href = '/';
                return;
            }



            regFormMessage.innerHTML = response.message;
        } catch (error) {
            console.log(error);
        }
    };

    const bindEvents = () => {

        regForm.addEventListener('submit', sendData);
    };

    const init = () => {
        bindEvents();
    };

    init();
})();
