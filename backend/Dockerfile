FROM node:7

RUN mkdir /usr/app
WORKDIR /usr/app

COPY package.json .
RUN npm install

COPY index.js /usr/app/
CMD npm start
