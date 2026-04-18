FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install express dotenv cors nodemailer nodemon

COPY . .

EXPOSE 5002

CMD ["node", "src/server.js"]