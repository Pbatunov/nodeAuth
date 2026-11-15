module.exports = (({userData, req, res}) => {
    const crypto = require('crypto');
    const dbConnection = require('../../Data-base/connection/main');
    const {login, password} = userData;
    const passwordHash = crypto.createHash('md5').update(password).digest('hex');

    const authCallBack = ({connection, responseToFront}) => {
        const sqlReqestSelectString = 'SELECT * FROM test_users WHERE login = ? AND password = ?';

        connection.query(sqlReqestSelectString, [login, passwordHash], (error, result) => {
            if (error) {
                connection.end();

                return logger(error);
            }

            if (!result.length) {
                responseToFront.message = 'Неверный логин или пароль!';

                res.send(responseToFront);
                connection.end();
                return logger(responseToFront.message);
            }
            const [user] = result;
            const {id, login, name, createDate} = user;

            connection.end();

            // Новая сессия после входа: защита от фиксации сессии.
            req.session.regenerate((error) => {
                if (error) {
                    logger(error);
                    return res.status(500).send({success: false, message: 'Не удалось создать сессию'});
                }

                req.session.userId = id;
                req.session.save(() => res.send({id, login, name, createDate}));
            });
        });
    };

    const logger = (message) => {
        console.log(`Registration Error: ${message}`);
    };

    const isValidate = () => {
        let isValid = false;
        const responseToFront = {
            success: false,
        };

        if (!login.trim()) {
            responseToFront.message = 'Введите логин';

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


        isValid = true;

        return isValid;
    };

    if (isValidate()) {
        dbConnection({
            logger,
            userData,
            req,
            res,
            callback: authCallBack,
        });
    }
});
