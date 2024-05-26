module.exports = (({userData, res}) => {

    const {name, login, password} = userData;
    const connection = require('../data-base/connection/main');

    const logger = (message) => {
        console.log(`Registration Error: ${message}`);
    };

    const isValidate = () => {
        let isValid = false;
        const passwordLength = 8;
        const responseToFront = {
            success: false,
        };

        if (!name.trim()) {
            responseToFront.message = 'Введите имя';

            res.send(responseToFront);
            logger('Введите имя');
            return isValid;
        }

        if (name.trim().length < 2) {
            responseToFront.message = 'Имя должно быть не короче двух символов';

            res.send(responseToFront);
            logger('Имя должно быть не короче двух символов');
            return isValid;
        }

        if (!login.trim()) {
            responseToFront.message = 'Введите логин';

            res.send(responseToFront);
            logger(responseToFront.message);
            return isValid;
        }

        if (login.match(new RegExp(/[А-яЁё]/))) {
            responseToFront.message = 'Логин должен содержать только латинские символы';

            res.send(responseToFront);
            logger(responseToFront.message);
            return isValid;
        }

        if (!password.trim()) {
            responseToFront.message = 'Введите пароль';

            res.send(responseToFront);
            logger(responseToFront.message);
            return isValid;
        }

        if (password.trim().length < passwordLength) {
            responseToFront.message = `Длина пароль дложна быть не менее ${passwordLength} символов`;

            res.send(responseToFront);
            logger(responseToFront.message);
            return isValid;
        }

        if (password.match(new RegExp(/[А-я]/))) {
            responseToFront.message = 'Пароль должен содержать только латинские символы';

            res.send(responseToFront);
            logger(responseToFront.message);
            return isValid;
        }

        if (!password.match(new RegExp(/\d/))) {
            responseToFront.message = 'Пароль должен содержать цифры';

            res.send(responseToFront);
            logger(responseToFront.message);
            return;
        }

        if (!password.match((/\[|\]|\/|\^|\$|\.|\||\?|\*|\(|\)|\+|-|@|_|:|;|=/))) {
            responseToFront.message = 'Пароль должен содержать спецсимволы';

            res.send(responseToFront);
            logger(responseToFront.message);
            return isValid;
        }

        isValid = true;

        return {
            isValid,
        };
    };

    const isRegistration = true;

    if (isValidate().isValid) {
        connection({logger, userData, res, isRegistration});
    }
});
