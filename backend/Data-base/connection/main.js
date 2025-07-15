module.exports = (({logger, callback}) => {
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
            console.log(error);
            connection.end();

            return logger(error.message);
        }

        const responseToFront = {
            message: null,
            success: false,
        };

        callback({connection, responseToFront});
    });
});
