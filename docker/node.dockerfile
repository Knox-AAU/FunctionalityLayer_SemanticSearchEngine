FROM node:21-alpine3.17

WORKDIR /app

COPY ./package.json ./

RUN npm i

COPY "../" ./

ENV PORT=80

EXPOSE 80

CMD [ "npm", "run", "server" ]