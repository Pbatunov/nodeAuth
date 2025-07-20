const express = require('express');
const router = express.Router();
const {createMessage, findChatMessages} = require('../Controllers/messages/main');

router.post('/', (req, res) => {
    if (!req.body) {
        res.sendStatus(400);
        return req.end();
    }

    const {chatId, senderId, message} = req.body;

    if (!chatId && !senderId && !message) {
        res.sendStatus(400).send('Ошибка при создании сообщения!');
        return req.end();
    }

    createMessage({chatId, senderId, message, res});
});

router.get('/:chatId', (req, res) => {
    if (!req.params) {
        res.sendStatus(400);
        return req.end();
    }

    const {chatId} = req.params;

    if (!chatId) {
        res.sendStatus(400).send('chatId не найден!');
        return req.end();
    }

    findChatMessages({chatId, res});
});

module.exports = router;
