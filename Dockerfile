# Builder
FROM node:10-alpine as builder

WORKDIR /src

COPY . /src
RUN yarn --network-timeout=100000 install
RUN yarn build

# Copy the config now so that we don't create another layer in the app image
#RUN cp /src/config.sample.json /src/webapp/config.json


# App
FROM nginx:alpine

COPY --from=builder /src/build /app

RUN rm -rf /usr/share/nginx/html \
 && ln -s /app /usr/share/nginx/html
