require('dotenv').config();
const express = require('express');
const {Server} = require('socket.io');
const app = express();
const session = require('express-session');
const cors = require('cors');
// eslint-disable-next-line no-undef
const port = process.env.PORT || 5000;
const userRoute = require('./Routes/userRoute');
const chatsRoute = require('./Routes/chatsRoute');
const messagesRoute = require('./Routes/messagesRoute');

app.use(cors({
    origin: '*',
}));

app.use(session({
    // eslint-disable-next-line no-undef
    secret: 'secret value',
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: '/',
        // eslint-disable-next-line no-undef
        maxAge: 3600000 * 24 * 365,
    },
}));

app.use(express.json());
app.use('/api/users', userRoute);
app.use('/api/chats', chatsRoute);
app.use('/api/messages', messagesRoute);

app.get('/', (req, res) => {
    return res.end();
});

const expressServer = app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});

const io = new Server(expressServer, {
    cors: {
        origin: 'http://localhost:3000',
    },
});

let onlineUsers = [];

io.on('connection', (socket) => {
    socket.on('userConnect', (userId) => {

        const hasOnlineUsers = onlineUsers.some((user) => user.userId === userId);

        if (!hasOnlineUsers) {
            onlineUsers.push({
                userId,
                socketId: socket.id,
            });
        }

        console.log({onlineUsers});

        io.emit('getOnlineUsers', onlineUsers);
    });

    socket.on('sendMessage', (message) => {

        console.log({message});

        const user = onlineUsers.find((user) => user.userId === message.companionId);

        if (user) {
            io.to(user.socketId).emit('getMessage', message);
        }

    });

    socket.on('disconnect', () => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
        io.emit('getOnlineUsers', onlineUsers);

    });
});
