const dbConnection = require('../Data-base/connection/main');

const logger = ({statusText, messageText}) => {
    console.log(`${statusText}: ${messageText}`);
};

// Пропускает запрос, только если текущий пользователь (из сессии) участвует в чате.
// getChatId достаёт chatId из запроса.
module.exports = (getChatId) => (req, res, next) => {
    const chatId = getChatId(req);
    const userId = req.session.userId;

    if (!chatId) {
        return res.sendStatus(400);
    }

    dbConnection({
        logger,
        res,
        from: 'requireChatParticipant',
        callback: ({connection}) => {
            connection.execute(
                'SELECT id FROM chats WHERE id = ? AND (firstId = ? OR secondId = ?)',
                [chatId, userId, userId],
                (error, result) => {
                    connection.end();

                    if (error) {
                        logger({statusText: 'requireChatParticipantError', messageText: error.message});
                        return res.status(500).send({success: false, message: 'Ошибка сервера'});
                    }

                    if (!result.length) {
                        return res.status(403).send({success: false, message: 'Нет доступа к этому чату'});
                    }

                    next();
                },
            );
        },
    });
};
