require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const cors = require('cors');
// eslint-disable-next-line no-undef
const port = process.env.PORT || 5000;
const userRoute = require('./Routes/userRoute');
const chatsRoute = require('./Routes/chatsRoute');

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

app.get('/', (req, res) => {
    return res.end();
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
