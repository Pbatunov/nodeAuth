module.exports = (({from, logger, callback}) => {
    const mysql = require('mysql2');

    const connection = mysql.createConnection({
        host: '77.222.40.109',
        user: 'batunov192',
        database: 'batunov192',
        password: 'ZkkpkMiv_2020',
        charset: 'cp1251',
    });

    connection.connect((error) => {
        if (error) {
            console.log(`${from}: ${error}`);
            connection.end();


            return logger({stausText: from, messageText: error.message});
        }

        const responseToFront = {
            message: null,
            success: false,
        };

        callback({connection, responseToFront});
    });
});
