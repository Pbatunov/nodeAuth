const {v4: uuidv4} = require('uuid');
const dbConnection = require('../../Data-base/connection/main');

const logger = ({status, message}) => {
    console.log(`${status}: ${message}`);
};

const formatDate = ({currentDate}) => {
    const dateString = new Intl.DateTimeFormat('RU', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZone: 'Europe/Moscow',
    }).format(currentDate);

    const dateArray = dateString.split(', ');
    const [date, time] = dateArray;
    const [day, month, year] = date.split('.');

    return `${year}-${month}-${day} ${time}`;
};


const createMessage = ({chatId, senderId, message, res}) => {
    console.log('create message');
    const createMessageCallback = ({connection, responseToFront}) => {
        let id = uuidv4().replaceAll('-', '');

        const sqlReqestSelectByIdString = `SELECT * FROM chat_messages WHERE id = '${id}'`;

        connection.query(sqlReqestSelectByIdString, (error, result) => {
            if (error) {
                connection.end();

                return logger({status: 'Ошибка соединения', error});
            }

            if (result.length) {
                id = uuidv4().replaceAll('-', '');

                console.log('Такой ID уже существует');
            }

            const createDate = formatDate(new Date());

            const sqlRequestInsertString = `INSERT INTO chat_messages (id, chatId, senderId, message ,createDate) VALUES ('${id}', '${chatId}', '${senderId}', '${message}', '${createDate}')`;

            connection.execute(sqlRequestInsertString, (error) => {
                if (error) {
                    connection.end();

                    return logger({status: 'Ошибка соединения', error});
                }

                responseToFront.success = true;
                responseToFront.message = 'Сообщение создано!';

                res.send(responseToFront);
                connection.end();
            });
        });
    };

    dbConnection({
        logger,
        chatId,
        senderId,
        message,
        res,
        callback: createMessageCallback,
    });
};

const findChatMessages = ({chatId, res}) => {
    const findChatMessagesCallback = ({connection, responseToFront}) => {

        const sqlReqestSelectByIdString = `SELECT * FROM chat_messages WHERE chatId = '${chatId}' ORDER BY createDate ASC`;

        connection.query(sqlReqestSelectByIdString, (error, result) => {
            if (error) {
                connection.end();

                return logger(error);
            }

            if (!result.length) {
                responseToFront.message = 'В этом чате пока нет ни одного сообщения!';
                responseToFront.success = false;

                res.send({responseToFront});
                connection.end();
                return logger(responseToFront.message);
            }

            res.send(result);
            res.end();
        });
    };

    dbConnection({
        logger,
        chatId,
        res,
        callback: findChatMessagesCallback,
    });
};

module.exports = {createMessage, findChatMessages};
