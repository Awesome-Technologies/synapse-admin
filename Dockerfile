# Builder
FROM node:lts as builder

ARG REACT_APP_SERVER

WORKDIR /src

COPY . /src
RUN yarn --network-timeout=300000 install
RUN REACT_APP_SERVER=$REACT_APP_SERVER yarn build


# App
FROM nginx:alpine

COPY --from=builder /src/build /app

RUN rm -rf /usr/share/nginx/html \
 && ln -s /app /usr/share/nginx/html
