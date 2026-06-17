# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# build:app skips deploy:onepixel (gh-pages-only step). vite outDir is "docs/".
RUN npm run build:app

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# vite `base: '/ecommerce-frontend/'` means assets expect that prefix in URLs
COPY --from=builder /app/docs /usr/share/nginx/html/ecommerce-frontend
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
