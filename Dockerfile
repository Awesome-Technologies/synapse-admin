# Builder
FROM node:lts as builder
LABEL org.opencontainers.image.url=https://github.com/Awesome-Technologies/synapse-admin org.opencontainers.image.source=https://github.com/Awesome-Technologies/synapse-admin

WORKDIR /src

COPY .yarn .yarnrc.yml ./
COPY package.json yarn.lock ./

# Disable telemetry
RUN yarn config set enableTelemetry 0
RUN yarn --network-timeout=300000 install --immutable

COPY . /src
RUN yarn build

# App
FROM nginx:stable-alpine

COPY --from=builder /src/dist /app

RUN rm -rf /usr/share/nginx/html \
 && ln -s /app /usr/share/nginx/html
