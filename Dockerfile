FROM node:23-alpine

RUN mkdir /app

WORKDIR /app

COPY package.json /app
RUN npm install

COPY models/ /app/models/
COPY views/ /app/views/
COPY public/ /app/public/

COPY app.js /app/

ENV NODE_ENV=production

ENV HOST=0.0.0.0
ENV PORT=5050

ENV TITLE="Hall X"
ENV PREFIX=
#ENV HALLS="/hall-a:Hall A;/hall-b:Hall B"

CMD node app.js
