const express = require('express');
const router = express.Router();
const {createMessage, findChatMessages} = require('../Controllers/messages/main');
const requireAuth = require('../middleware/requireAuth');
const requireChatParticipant = require('../middleware/requireChatParticipant');

router.use(requireAuth);

router.post('/', requireChatParticipant((req) => req.body?.chatId), (req, res) => {
    if (!req.body) {
        res.sendStatus(400);
        return req.end();
    }

    const {chatId, message} = req.body;
    // Отправитель всегда текущий пользователь из сессии.
    const senderId = req.session.userId;

    if (!chatId || !senderId || !message) {
        res.sendStatus(400);
        return res.end();
    }

    createMessage({chatId, senderId, message, res});
});

router.get('/:chatId', requireChatParticipant((req) => req.params.chatId), (req, res) => {
    if (!req.params) {
        res.sendStatus(400);
        return req.end();
    }

    const {chatId} = req.params;

    if (!chatId) {
        res.sendStatus(400);
        return req.end();
    }

    findChatMessages({chatId, res});
});

module.exports = router;
