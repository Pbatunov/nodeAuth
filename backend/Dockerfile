FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Папка для аватарок. Монтируется как volume, чтобы файлы переживали пересборку образа.
RUN mkdir -p uploads/avatars && chown -R node:node uploads

USER node
EXPOSE 5000

# Запускаем node напрямую: nodemon из npm start нужен только для разработки.
CMD ["node", "app.js"]
