# Builder
FROM node:lts AS builder
LABEL org.opencontainers.image.url=https://github.com/Awesome-Technologies/synapse-admin org.opencontainers.image.source=https://github.com/Awesome-Technologies/synapse-admin
# Base path for synapse admin
ARG BASE_PATH=./

WORKDIR /src

# Copy .yarn directory to the working directory (must be on a separate line!)
# Use https://docs.docker.com/engine/reference/builder/#copy---parents when available
COPY .yarn .yarn
COPY package.json .yarnrc.yml yarn.lock ./

# Disable telemetry and install packages
RUN yarn config set enableTelemetry 0 && yarn install --immutable --network-timeout=300000

COPY . /src
RUN yarn build --base=$BASE_PATH

# App
FROM nginx:stable-alpine

COPY --from=builder /src/dist /app

RUN rm -rf /usr/share/nginx/html \
 && ln -s /app /usr/share/nginx/html
