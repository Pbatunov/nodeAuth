// Пропускает только запросы с активной сессией (после входа).
module.exports = (req, res, next) => {
    if (!req.session?.userId) {
        return res.status(401).send({success: false, message: 'Требуется вход в систему'});
    }

    next();
};
