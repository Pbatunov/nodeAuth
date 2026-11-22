import {useEffect, useState} from 'react';
import {io} from 'socket.io-client';

// Подключение к сокету и список онлайн-пользователей.
export const useChatSocket = ({user}) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(null);

    useEffect(() => {
        // Сокет создаём только после входа: иначе сервер отклонит подключение без сессии.
        if (!user) {
            return;
        }

        const newSocket = io();
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        if (!socket || !user) {
            return;
        }

        const {id: userId} = user;

        // После разрыва соединения (экран заблокирован) socket.io переподключается с новым id,
        // поэтому пользователя нужно зарегистрировать на сервере заново при каждом connect.
        const registerUser = () => socket.emit('userConnect', userId);

        registerUser();
        socket.on('connect', registerUser);

        socket.on('getOnlineUsers', (users) => {
            setOnlineUsers(users);
        });

        return () => {
            socket.off('connect', registerUser);
            socket.off('getOnlineUsers');
        };
    }, [socket, user]);

    return {socket, onlineUsers};
};
