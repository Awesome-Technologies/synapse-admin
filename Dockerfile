# Builder
FROM node:lts AS builder

WORKDIR /src

COPY . /src
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN yarn --network-timeout=100000 install
RUN yarn build


# App
FROM nginx:alpine

COPY --from=builder /src/build /app

RUN rm -rf /usr/share/nginx/html \
 && ln -s /app /usr/share/nginx/html
