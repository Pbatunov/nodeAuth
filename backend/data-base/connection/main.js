module.exports = (({logger, userData, req, res, isAuth, isRegistration}) => {
    const crypto = require('crypto');
    const mysql = require('mysql2');
    const {name, login} = userData;
    console.log({name});
    const password = crypto.createHash('md5').update(userData.password).digest('hex');

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

        if (isRegistration) {

            const sqlReqestSelectString = `SELECT * FROM test_users WHERE login = '${login}'`;

            connection.query(sqlReqestSelectString, (error, result) => {
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

                const sqlRequestInsertString = `INSERT INTO test_users (name, login, password, scores) VALUES ('${name}', '${login}', '${password}', '0')`;

                connection.execute(sqlRequestInsertString, (error) => {
                    if (error) {
                        connection.end();

                        return logger(error);
                    }

                    responseToFront.success = true;

                    res.send(responseToFront);
                    connection.end();

                });
            });

            return;
        }

        if (isAuth) {
            const sqlReqestSelectString = `SELECT * FROM test_users WHERE login = '${login}' and password = '${password}'`;

            connection.query(sqlReqestSelectString, (error, result) => {
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

                responseToFront.success = true;
                req.session.auth = true;
                req.session.username = result[0].name;
                req.session.save();
                res.send(responseToFront);

                console.log({session: req.session});
                res.end();
            });
        }
    });
});
