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

module.exports = {findAllUsers};
