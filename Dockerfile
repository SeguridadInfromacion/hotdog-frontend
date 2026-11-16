# Etapa 1: compilar la aplicación. Nada de esta etapa (Node, node_modules,
# código fuente) llega a la imagen final.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: servir archivos estáticos con nginx sin privilegios de root.
FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Se borra el contenido de fábrica de nginx (páginas de ejemplo) antes de copiar el sitio.
USER root
RUN rm -rf /usr/share/nginx/html/*
USER 101
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
