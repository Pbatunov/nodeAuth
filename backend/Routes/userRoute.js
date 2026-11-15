const express = require('express');
const urlencodedParser = express.urlencoded({extended: true});
const router = express.Router();
const registration = require('../Controllers/registration/main');
const auth = require('../Controllers/auth/main');
const {findAllUsers, getCurrentUser} = require('../Controllers/users/main');
const requireAuth = require('../middleware/requireAuth');

router.get('/', requireAuth, (req, res) => {
    findAllUsers({res});
});

router.get('/me', requireAuth, (req, res) => {
    getCurrentUser({userId: req.session.userId, res});
});

router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('sid');
        res.send({success: true});
    });
});

router.post('/registration', urlencodedParser, (req, res) => {
    if (!req.body) {
        return res.sendStatus(400);
    }

    registration({userData: req.body, res});
});

router.post('/auth', (req, res) => {

    if (!req.body) {
        return res.sendStatus(400);
    }

    auth({userData: req.body, req, res});
});

module.exports = router;
