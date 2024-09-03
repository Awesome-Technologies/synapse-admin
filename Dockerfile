FROM ghcr.io/static-web-server/static-web-server:2

ENV SERVER_ROOT=/app

COPY ./dist /app
