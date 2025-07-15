const express = require('express');
const urlencodedParser = express.urlencoded({extended: true});
const router = express.Router();
const registration = require('../Controllers/registration/main');
const auth = require('../Controllers/auth/main');

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
