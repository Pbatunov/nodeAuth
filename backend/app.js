require('dotenv').config();
const express = require('express');
const {Server} = require('socket.io');
const app = express();
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');
// eslint-disable-next-line no-undef
const port = process.env.PORT || 5000;
const userRoute = require('./Routes/userRoute');
const chatsRoute = require('./Routes/chatsRoute');
const messagesRoute = require('./Routes/messagesRoute');

// Фронтенд ходит на API через прокси того же origin, поэтому CORS не нужен.
if (!process.env.SESSION_SECRET) {
    console.warn('SESSION_SECRET не задан: сессии сбросятся при перезапуске сервера');
}

// Сессии хранятся в MySQL, а не в памяти: переживают перезапуск и не текут по памяти.
// Таблица sessions создаётся автоматически при первом запуске.
const MySQLStore = require('express-mysql-session')(session);
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    clearExpired: true,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 1000 * 60 * 60 * 24 * 7,
});

const sessionMiddleware = session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    name: 'sid',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // HTTPS пока не используется
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
});

app.use(sessionMiddleware);

app.use(express.json());
// Аватарки отдаются с того же origin, что и API (прокси в dev-режиме проксирует только /api).
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/users', userRoute);
app.use('/api/chats', chatsRoute);
app.use('/api/messages', messagesRoute);

app.get('/', (req, res) => {
    return res.end();
});

const expressServer = app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});

const io = new Server(expressServer);

// Сессия из cookie доступна сокету через socket.request.session.
io.engine.use(sessionMiddleware);

// Без входа подключение к сокету не принимаем.
io.use((socket, next) => {
    if (!socket.request.session?.userId) {
        return next(new Error('unauthorized'));
    }

    next();
});

let onlineUsers = [];

io.on('connection', (socket) => {
    socket.on('userConnect', () => {
        // Идентичность берётся из сессии, а не из payload.
        const userId = socket.request.session.userId;

        // Если пользователь переподключился раньше, чем сервер заметил разрыв старого сокета,
        // заменяем запись: иначе сообщения будут уходить на мёртвый socketId.
        onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
        onlineUsers.push({
            userId,
            socketId: socket.id,
        });

        io.emit('getOnlineUsers', onlineUsers);
    });

    socket.on('sendMessage', (message) => {
        // Отправитель всегда тот, кто вошёл в сессии.
        const senderId = socket.request.session.userId;

        const user = onlineUsers.find((user) => user.userId === message.companionId);

        if (user) {
            io.to(user.socketId).emit('getMessage', {...message, senderId});
        }

    });

    socket.on('disconnect', () => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
        io.emit('getOnlineUsers', onlineUsers);

    });
});

// Отправляет событие пользователю, если он сейчас онлайн. Используется HTTP-маршрутами.
app.locals.notifyUser = (userId, event, payload) => {
    const user = onlineUsers.find((item) => item.userId === userId);

    if (user) {
        io.to(user.socketId).emit(event, payload);
    }
};
