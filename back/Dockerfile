FROM node:latest
LABEL authors="romainchampliau"

COPY ./ /app/

WORKDIR /app

RUN apk update && apk upgrade --no-cache

RUN npm install

ENTRYPOINT ["npm", "run", "start:dev"]



