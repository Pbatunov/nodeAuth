// Адрес бэкенда задаётся в frontend/.env: REACT_APP_API_URL=http://192.168.1.10:5000
// Если переменная не задана, берётся хост, с которого открыта страница,
// поэтому приложение работает и на localhost, и по IP в локальной сети.
export const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000`;
