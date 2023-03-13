FROM node:lts-alpine
LABEL authors="romainchampliau"

COPY ./ /app/

RUN apk update

WORKDIR /app/

RUN npm install

EXPOSE 5173

#CMD ["npm", "start"]
CMD ["npm", "run", "dev", "--", "--port", "5173", "--host"]