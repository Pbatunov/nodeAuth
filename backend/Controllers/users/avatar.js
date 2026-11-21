const fs = require('fs');
const path = require('path');
const dbConnection = require('../../Data-base/connection/main');

const AVATARS_DIR = path.join(__dirname, '../../uploads/avatars');
const AVATARS_URL = '/api/uploads/avatars';
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

fs.mkdirSync(AVATARS_DIR, {recursive: true});

const logger = ({statusText, messageText}) => {
    console.log(`${statusText}: ${messageText}`);
};

// Тип файла определяем по первым байтам, а не по расширению или Content-Type, которые прислал клиент.
const detectImageExtension = (buffer) => {
    const head = buffer.subarray(0, 12);

    if (head[0] === 0xFF && head[1] === 0xD8 && head[2] === 0xFF) {
        return 'jpg';
    }

    if (head.subarray(0, 8).equals(PNG_SIGNATURE)) {
        return 'png';
    }

    if (head.subarray(0, 4).toString('latin1') === 'RIFF' && head.subarray(8, 12).toString('latin1') === 'WEBP') {
        return 'webp';
    }

    return null;
};

const removeAvatarFile = (avatarUrl) => {
    if (!avatarUrl) {
        return;
    }

    fs.unlink(path.join(AVATARS_DIR, path.basename(avatarUrl)), () => {});
};

// Сохраняет новый аватар и заменяет им старый. Файл пишется до обновления БД, поэтому при ошибке БД его откатываем.
const updateAvatar = ({userId, file, res}) => {
    const extension = detectImageExtension(file.data);

    if (!extension) {
        return res.status(400).send({success: false, message: 'Поддерживаются только JPEG, PNG и WebP'});
    }

    const fileName = `${userId}-${Date.now()}.${extension}`;
    const avatarUrl = `${AVATARS_URL}/${fileName}`;
    const filePath = path.join(AVATARS_DIR, fileName);

    const updateAvatarCallback = ({connection}) => {
        connection.execute('SELECT avatar FROM test_users WHERE id = ?', [userId], (error, result) => {
            if (error || !result.length) {
                connection.end();
                logger({statusText: 'updateAvatarSelectError', messageText: error?.message || 'Пользователь не найден'});

                return res.status(error ? 500 : 401).send({success: false, message: 'Не удалось сохранить аватар'});
            }

            const previousAvatarUrl = result[0].avatar;

            fs.writeFile(filePath, file.data, (writeError) => {
                if (writeError) {
                    connection.end();
                    logger({statusText: 'updateAvatarWriteError', messageText: writeError.message});

                    return res.status(500).send({success: false, message: 'Не удалось сохранить аватар'});
                }

                connection.execute('UPDATE test_users SET avatar = ? WHERE id = ?', [avatarUrl, userId], (updateError) => {
                    connection.end();

                    if (updateError) {
                        fs.unlink(filePath, () => {});
                        logger({statusText: 'updateAvatarUpdateError', messageText: updateError.message});

                        return res.status(500).send({success: false, message: 'Не удалось сохранить аватар'});
                    }

                    removeAvatarFile(previousAvatarUrl);
                    res.send({success: true, avatar: avatarUrl});
                });
            });
        });
    };

    dbConnection({
        logger,
        res,
        callback: updateAvatarCallback,
        from: 'updateAvatar',
    });
};

module.exports = {updateAvatar};
