const express = require('express');
const router = express.Router();
const {createChat, findAllChatsWithUser, findSingleChat} = require('../Controllers/chats/main');

router.post('/', (req, res) => {
    if (!req.body) {
        res.sendStatus(400);
        return req.end();
    }

    const {firstId, secondId} = req.body;

    if (!firstId && !secondId) {
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

    findSingleChat({firstId, secondId, res});
});

module.exports = router;
