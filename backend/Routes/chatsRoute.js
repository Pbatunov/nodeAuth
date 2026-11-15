const express = require('express');
const router = express.Router();
const {createChat, findAllChatsWithUser, findSingleChat, deleteChat} = require('../Controllers/chats/main');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

router.post('/', (req, res) => {
    if (!req.body) {
        res.sendStatus(400);
        return req.end();
    }

    // Создатель чата — текущий пользователь из сессии.
    const firstId = req.session.userId;
    const {secondId} = req.body;

    if (!secondId) {
        res.sendStatus(400).send('Ошибка при создании чата!');
        return req.end();
    }

    createChat({firstId, secondId, res});
});

router.get('/:userId', (req, res) => {
    if (!req.params) {
        res.sendStatus(400);
        return req.end();
    }

    const {userId} = req.params;

    if (!userId) {
        res.sendStatus(400).send('userId не найден!');
        return req.end();
    }

    if (userId !== req.session.userId) {
        return res.sendStatus(403);
    }

    findAllChatsWithUser({userId, res});
});

router.get('/find/:firstId/:secondId', (req, res) => {
    if (!req.params) {
        res.sendStatus(400);
        return req.end();
    }

    const {firstId, secondId} = req.params;

    if (!firstId && !secondId) {
        res.sendStatus(400).send('firstId и secondId не найдены!');
        return req.end();
    }

    const currentUserId = req.session.userId;

    if (currentUserId !== firstId && currentUserId !== secondId) {
        return res.sendStatus(403);
    }

    findSingleChat({firstId, secondId, res});
});

router.delete('/:chatId', (req, res) => {
    const {chatId} = req.params;
    const userId = req.session.userId;

    if (!chatId || !userId) {
        return res.sendStatus(400);
    }

    deleteChat({chatId, userId, res, notifyUser: req.app.locals.notifyUser});
});

module.exports = router;
