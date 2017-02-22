FROM bayesimpact/react-base:latest

RUN apt-get install -qqy git

# Install needed node modules (hopefully most of them are already in base image).
COPY package.json .
RUN npm install

EXPOSE 80

ENV BIND_HOST=0.0.0.0


CMD ["npm", "start"]
