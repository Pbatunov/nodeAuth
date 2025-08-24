const {v4: uuidv4} = require('uuid');
const dbConnection = require('../../Data-base/connection/main');

const createChat = ({firstId, secondId, res, chatsData}) => {
    const createChatCallback = ({connection, responseToFront}) => {
        let id = uuidv4().replaceAll('-', '');

        const sqlReqestSelectByIdString = `SELECT * FROM chats WHERE id = '${id}'`;

        connection.query(sqlReqestSelectByIdString, (error, result) => {
            if (error) {
                connection.end();

                return logger({statusText: 'createChatError', messageText: error});
            }

            if (result.length) {
                id = uuidv4().replaceAll('-', '');

                console.log('Такой ID уже существует');
            }

            const createDate = new Intl.DateTimeFormat('en-GB', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                timeZone: 'Europe/Moscow',
                timeZoneName: 'short',
            }).format(new Date());

            const sqlRequestInsertString = `INSERT INTO chats (id, firstId, secondId, createDate) VALUES ('${id}', '${firstId}', '${secondId}', '${createDate}')`;

            connection.execute(sqlRequestInsertString, (error) => {
                if (error) {
                    connection.end();

                    return logger({statusText: 'createChatError2', messageText: error});
                }

                responseToFront.success = true;
                responseToFront.message = 'Чат создан!';

                res.send(responseToFront);
                connection.end();
            });
        });
    };

    dbConnection({
        logger, chatsData, res, callback: createChatCallback, from: 'createChat',
    });
};

const logger = ({statusText, messageText}) => {
    console.log(`${statusText}: ${messageText}`);
};

const findAllChatsWithUser = ({userId, res}) => {
    const findAllChatsCallback = ({connection, responseToFront}) => {
        const sqlReqestSelectByIdString = `
            SELECT 
             c.id AS id,
             CASE 
             WHEN c.firstId <> '${userId}' THEN u1.name
             ELSE u2.name
             END AS companionName,
             CASE 
             WHEN c.firstId <> '${userId}' THEN c.firstId
             ELSE c.secondId
             END AS companionId,
             c.createDate,
             m.message AS lastMessage,
             m.createDate AS messageDate
            FROM chats c
            JOIN test_users u1 ON c.firstId = u1.id
            JOIN test_users u2 ON c.secondId = u2.id
            LEFT JOIN (
             SELECT 
             chatId,
             message,
             createDate,
             IF(@chatId = chatId, @rn := @rn + 1, @rn := 1) AS rn,
             @chatId := chatId
             FROM chat_messages,
             (SELECT @chatId := NULL, @rn := 0) vars
             ORDER BY chatId, createDate DESC
            ) m ON c.id = m.chatId AND m.rn = 1
            WHERE 
             (c.firstId = '${userId}'
             OR c.secondId = '${userId}')`;

        connection.query(sqlReqestSelectByIdString, (error, result) => {
            if (error) {
                connection.end();

                return logger({statusText: 'findAllChats', messageText: error});
            }

            if (!result.length) {
                responseToFront.message = 'Чаты не найдены!';
                responseToFront.success = false;

                res.send({responseToFront});
                connection.end();
                return logger({statusText: 'findAllChats2', messageText: responseToFront.message});
            }

            res.send(result);
            res.end();
        });
    };

    dbConnection({
        logger,
        userId,
        res,
        callback: findAllChatsCallback,
        from: 'findAllChatsWithUser',
    });
};

const findSingleChat = ({firstId, secondId, res}) => {
    const findSingleChatCallback = ({connection, responseToFront}) => {

        const sqlReqestSelectByIdString = `SELECT * FROM chats WHERE firstId = '${firstId}' AND secondId = '${secondId}'`;

        connection.query(sqlReqestSelectByIdString, (error, result) => {
            if (error) {
                connection.end();

                return logger({statusText: 'findSingleChatError', messageText: error});
            }

            if (!result.length) {
                responseToFront.message = 'Чат не найден!';
                responseToFront.success = false;

                res.send({responseToFront});
                connection.end();
                return logger({statusText: 'findSingleChatError2', messageText: responseToFront.message});
            }

            const [chat] = result;

            res.send(chat);
            res.end();
        });
    };

    dbConnection({
        logger, firstId, secondId, res, callback: findSingleChatCallback, from: 'findSingleChat',
    });
};

module.exports = {createChat, findAllChatsWithUser, findSingleChat};
