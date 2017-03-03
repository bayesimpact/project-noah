FROM node:7

RUN mkdir /usr/app
WORKDIR /usr/app

COPY package.json .
RUN npm install

COPY config.js notification_handler.js /usr/app/
CMD npm start
