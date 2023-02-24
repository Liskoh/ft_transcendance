FROM node:lts-alpine
LABEL authors="romainchampliau"

COPY ./     /app/

RUN apk update

WORKDIR /app

RUN npm install
RUN mkdir -p dist
RUN chown node:node dist

CMD tail -f
CMD ["npm", "run", "start:dev"]
