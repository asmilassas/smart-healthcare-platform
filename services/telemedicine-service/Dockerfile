FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install express mongoose dotenv cors nodemon

COPY . .

EXPOSE 5003

CMD ["node", "src/server.js"]