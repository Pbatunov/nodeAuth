module.exports = (({userData, res}) => {
    const crypto = require('crypto');
    const {v4: uuidv4} = require('uuid');
    const dbConnection = require('../../Data-base/connection/main');
    const {name, login, password} = userData;
    const passwordHash = crypto.createHash('md5').update(password).digest('hex');

    const registrationCallback = ({connection, responseToFront}) => {
        let id = uuidv4().replaceAll('-', '');

        const sqlReqestSelectByIdString = `SELECT * FROM test_users WHERE id = '${id}'`;

        connection.query(sqlReqestSelectByIdString, (error, result) => {
            if (error) {
                connection.end();

                return logger(error);
            }

            if (result.length) {
                id = uuidv4().replaceAll('-', '');

                console.log('Такой ID уже существует');
            }
        });

        const sqlReqestSelectByLoginString = `SELECT * FROM test_users WHERE login = '${login}'`;

        connection.query(sqlReqestSelectByLoginString, (error, result) => {
            if (error) {
                connection.end();

                return logger(error);
            }

            if (result.length) {
                connection.end();

                responseToFront.message = 'Такой логин уже существует';

                res.send(responseToFront);
                return logger(responseToFront.message);
            }

            const createDate = new Intl.DateTimeFormat('en-GB', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                timeZone: 'Europe/Moscow',
                timeZoneName: 'short',
            }).format(new Date());

            const sqlRequestInsertString = `INSERT INTO test_users (id, name, login, password, createDate) VALUES ('${id}', '${name}', '${login}', '${passwordHash}', '${createDate}')`;

            connection.execute(sqlRequestInsertString, (error) => {
                if (error) {
                    connection.end();

                    return logger(error);
                }

                responseToFront.success = true;
                responseToFront.message = 'Вы успешно зарегистрировались!';

                res.send(responseToFront);
                connection.end();
            });
        });
    };

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
            responseToFront.message = `Длина пароля должна быть не менее ${passwordLength} символов`;

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
            return isValid;
        }

        if (!password.match((/\[|\]|\/|\^|\$|\.|\||\?|\*|\(|\)|\+|-|@|_|:|;|=/))) {
            responseToFront.message = 'Пароль должен содержать спецсимволы';

            res.send(responseToFront);
            logger(responseToFront.message);
            return isValid;
        }

        isValid = true;

        return isValid;
    };

    if (isValidate()) {
        dbConnection({
            logger,
            userData,
            res,
            callback: registrationCallback,
        });
    }
});
