// Пустой адрес = тот же origin, что и страница. Запросы идут через прокси (src/setupProxy.js)
// или через reverse proxy в продакшене. Так cookie сессии работают без CORS.
export const API_URL = '';
