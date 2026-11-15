const dbConnection = require('../../Data-base/connection/main');

const logger = ({statusText, messageText}) => {
    console.log(`${statusText}: ${messageText}`);
};

// Отдаём только id и имя: логины и хэши паролей наружу не выходят.
const findAllUsers = ({res}) => {
    const findAllUsersCallback = ({connection}) => {
        connection.query('SELECT id, name FROM test_users ORDER BY name', (error, result) => {
            connection.end();

            if (error) {
                logger({statusText: 'findAllUsersError', messageText: error.message});
                return res.status(500).send([]);
            }

            res.send(result);
        });
    };

    dbConnection({
        logger,
        res,
        callback: findAllUsersCallback,
        from: 'findAllUsers',
    });
};

// Данные текущего пользователя по сессии (для восстановления входа после перезагрузки).
const getCurrentUser = ({userId, res}) => {
    const getCurrentUserCallback = ({connection}) => {
        connection.execute(
            'SELECT id, login, name, createDate FROM test_users WHERE id = ?',
            [userId],
            (error, result) => {
                connection.end();

                if (error) {
                    logger({statusText: 'getCurrentUserError', messageText: error.message});
                    return res.status(500).send({success: false});
                }

                if (!result.length) {
                    return res.status(401).send({success: false, message: 'Пользователь не найден'});
                }

                res.send(result[0]);
            },
        );
    };

    dbConnection({
        logger,
        res,
        callback: getCurrentUserCallback,
        from: 'getCurrentUser',
    });
};

module.exports = {findAllUsers, getCurrentUser};
