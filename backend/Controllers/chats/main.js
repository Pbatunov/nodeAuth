const {v4: uuidv4} = require('uuid');
const dbConnection = require('../../Data-base/connection/main');

const createChat = ({firstId, secondId, res, chatsData}) => {
    const createChatCallback = ({connection, responseToFront}) => {
        let id = uuidv4().replaceAll('-', '');

        const sqlReqestSelectByIdString = 'SELECT * FROM chats WHERE id = ?';

        connection.query(sqlReqestSelectByIdString, [id], (error, result) => {
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

            const sqlRequestInsertString = 'INSERT INTO chats (id, firstId, secondId, createDate) VALUES (?, ?, ?, ?)';

            connection.execute(sqlRequestInsertString, [id, firstId, secondId, createDate], (error) => {
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
             WHEN c.firstId <> ? THEN u1.name
             ELSE u2.name
             END AS companionName,
             CASE
             WHEN c.firstId <> ? THEN c.firstId
             ELSE c.secondId
             END AS companionId,
             CASE
             WHEN c.firstId <> ? THEN u1.avatar
             ELSE u2.avatar
             END AS companionAvatar,
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
             (c.firstId = ?
             OR c.secondId = ?)`;

        // Порядок параметров совпадает с порядком плейсхолдеров в запросе: три в SELECT, два в WHERE.
        connection.query(sqlReqestSelectByIdString, [userId, userId, userId, userId, userId], (error, result) => {
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
            connection.end();
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

        const sqlReqestSelectByIdString = 'SELECT * FROM chats WHERE firstId = ? AND secondId = ?';

        connection.query(sqlReqestSelectByIdString, [firstId, secondId], (error, result) => {
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
            connection.end();
        });
    };

    dbConnection({
        logger, firstId, secondId, res, callback: findSingleChatCallback, from: 'findSingleChat',
    });
};

const deleteChat = ({chatId, userId, res, notifyUser}) => {
    const deleteChatCallback = ({connection}) => {
        // Удалять может только участник чата.
        const checkSql = 'SELECT id, firstId, secondId FROM chats WHERE id = ? AND (firstId = ? OR secondId = ?)';

        connection.execute(checkSql, [chatId, userId, userId], (error, result) => {
            if (error) {
                connection.end();
                logger({statusText: 'deleteChatCheckError', messageText: error});

                return res.status(500).send({success: false, message: 'Ошибка при удалении чата!'});
            }

            if (!result.length) {
                connection.end();

                return res.status(404).send({success: false, message: 'Чат не найден!'});
            }

            connection.execute('DELETE FROM chat_messages WHERE chatId = ?', [chatId], (error) => {
                if (error) {
                    connection.end();
                    logger({statusText: 'deleteChatMessagesError', messageText: error});

                    return res.status(500).send({success: false, message: 'Ошибка при удалении чата!'});
                }

                connection.execute('DELETE FROM chats WHERE id = ?', [chatId], (error) => {
                    connection.end();

                    if (error) {
                        logger({statusText: 'deleteChatError', messageText: error});

                        return res.status(500).send({success: false, message: 'Ошибка при удалении чата!'});
                    }

                    res.send({success: true, message: 'Чат удалён!'});

                    // Сообщаем собеседнику, что чат удалён, если он онлайн.
                    const [chat] = result;
                    const companionId = chat.firstId === userId ? chat.secondId : chat.firstId;
                    notifyUser?.(companionId, 'chatDeleted', {chatId});
                });
            });
        });
    };

    dbConnection({
        logger, res, callback: deleteChatCallback, from: 'deleteChat',
    });
};

module.exports = {createChat, findAllChatsWithUser, findSingleChat, deleteChat};
