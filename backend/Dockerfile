# Build Stage
FROM node:24-alpine3.24 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

# Runtime Stage
FROM node:24-alpine3.24

WORKDIR /app

COPY --from=builder /app /app

# Remove npm, npx and bundled npm dependencies
RUN rm -rf /usr/local/lib/node_modules/npm

RUN chown -R node:node /app

USER node

EXPOSE 4000

CMD ["node", "server.js"]