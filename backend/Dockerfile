FROM node:7

RUN mkdir /usr/app
WORKDIR /usr/app

COPY package.json .
RUN npm install

COPY dummy_data_importer.js /usr/app/
CMD npm start
