FROM node:lts-alpine
LABEL authors="romainchampliau"

COPY ./     /app/

RUN apk update

WORKDIR /app

RUN npm install

CMD ["npm", "run", "start"]



