FROM node:18.16-alpine3.17

ENV NODE_ENV production
WORKDIR /app
RUN chown node:node /app

COPY . /app
RUN npm ci --only=production

USER node

CMD "node" "index.js"
