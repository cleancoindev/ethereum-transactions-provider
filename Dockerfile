FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .

USER node 

CMD [ "npm", "start" ]

EXPOSE 3005
