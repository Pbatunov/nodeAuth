module.exports = (({from, logger, callback, res}) => {
    const mysql = require('mysql2');

    const connection = mysql.createConnection({
        host: '77.222.40.109',
        user: 'batunov192',
        database: 'batunov192',
        password: 'ZkkpkMiv_2020',
        charset: 'cp1251',
    });

    // Без обработчика mysql2 кидает неперехваченное 'error' и роняет процесс.
    connection.on('error', (error) => {
        logger({statusText: from, messageText: error.message});
    });

    connection.connect((error) => {
        if (error) {
            logger({statusText: from, messageText: error.message});

            // Соединение уже закрыто, вызывать connection.end() не нужно.
            if (res && !res.headersSent) {
                res.status(503).send([]);
            }

            return;
        }

        const responseToFront = {
            message: null,
            success: false,
        };

        callback({connection, responseToFront});
    });
});
