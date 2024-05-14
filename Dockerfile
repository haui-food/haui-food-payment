FROM node:16

WORKDIR /server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8668

CMD ["node", "./src/server.js"]
