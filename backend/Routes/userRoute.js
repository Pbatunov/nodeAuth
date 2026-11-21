const express = require('express');
const fileUpload = require('express-fileupload');
const urlencodedParser = express.urlencoded({extended: true});
const router = express.Router();
const registration = require('../Controllers/registration/main');
const auth = require('../Controllers/auth/main');
const {findAllUsers, getCurrentUser} = require('../Controllers/users/main');
const {updateAvatar} = require('../Controllers/users/avatar');
const requireAuth = require('../middleware/requireAuth');

const AVATAR_MAX_SIZE = 2 * 1024 * 1024;
// Файл приходит multipart-формой. abortOnLimit выключен, чтобы вернуть понятный ответ, а не пустой.
const avatarUpload = fileUpload({limits: {fileSize: AVATAR_MAX_SIZE}, abortOnLimit: false});

router.get('/', requireAuth, (req, res) => {
    findAllUsers({res});
});

router.get('/me', requireAuth, (req, res) => {
    getCurrentUser({userId: req.session.userId, res});
});

// Аватар меняется только для себя: id берётся из сессии, а не из адреса.
router.post('/me/avatar', requireAuth, avatarUpload, (req, res) => {
    const file = req.files?.avatar;

    if (!file) {
        return res.status(400).send({success: false, message: 'Выберите файл'});
    }

    if (file.truncated) {
        return res.status(413).send({success: false, message: 'Файл больше 2 МБ'});
    }

    updateAvatar({userId: req.session.userId, file, res});
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
