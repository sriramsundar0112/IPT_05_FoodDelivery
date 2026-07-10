# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Runtime Stage

FROM nginx:1.30.3-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY entrypoint.sh /usr/share/nginx/html

RUN chmod +x /usr/share/nginx/html/entrypoint.sh

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["/usr/share/nginx/html/entrypoint.sh"]