module.exports = (({userData, req, res}) => {
    const crypto = require('crypto');
    const dbConnection = require('../../Data-base/connection/main');
    const {login, password} = userData;
    const passwordHash = crypto.createHash('md5').update(password).digest('hex');

    const authCallBack = ({connection, responseToFront}) => {
        const sqlReqestSelectString = `SELECT * FROM test_users WHERE login = '${login}' and password = '${passwordHash}'`;

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
            const [user] = result;
            const {id, login, name, createDate} = user;

            res.send({id, login, name, createDate});
            req.session.save();
            return res.end();
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
