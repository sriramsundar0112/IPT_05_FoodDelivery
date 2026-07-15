FROM node:22-alpine

RUN npm install -g npm@12.0.1

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --chown=node:node . .

USER node

EXPOSE 4000

CMD ["npm", "start"]