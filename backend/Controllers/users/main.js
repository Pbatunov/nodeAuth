const dbConnection = require('../../Data-base/connection/main');

const logger = ({statusText, messageText}) => {
    console.log(`${statusText}: ${messageText}`);
};

// Поиск по нику (логину): только точное совпадение, с учётом регистра.
// Список пользователей не отдаём, поэтому по запросам нельзя узнать остальных.
// Пароль и createDate наружу не выходят. Сам пользователь в результаты не попадает.
const LOGIN_MAX_LENGTH = 255;

const searchUserByLogin = ({login, userId, res}) => {
    const normalizedLogin = typeof login === 'string' ? login.trim() : '';

    if (!normalizedLogin || normalizedLogin.length > LOGIN_MAX_LENGTH) {
        return res.status(400).send({success: false, message: 'Введите ник'});
    }

    const searchUserCallback = ({connection}) => {
        connection.execute(
            'SELECT id, name, login, avatar FROM test_users WHERE login COLLATE utf8mb4_bin = ? AND id <> ? LIMIT 1',
            [normalizedLogin, userId],
            (error, result) => {
                connection.end();

                if (error) {
                    logger({statusText: 'searchUserByLoginError', messageText: error.message});
                    return res.status(500).send({success: false});
                }

                if (!result.length) {
                    return res.status(404).send({success: false, message: 'Пользователь не найден'});
                }

                res.send(result[0]);
            },
        );
    };

    dbConnection({
        logger,
        res,
        callback: searchUserCallback,
        from: 'searchUserByLogin',
    });
};

// Данные текущего пользователя по сессии (для восстановления входа после перезагрузки).
const getCurrentUser = ({userId, res}) => {
    const getCurrentUserCallback = ({connection}) => {
        connection.execute(
            'SELECT id, login, name, createDate, avatar FROM test_users WHERE id = ?',
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

module.exports = {searchUserByLogin, getCurrentUser};
