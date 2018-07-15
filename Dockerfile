FROM node:10 as builder
ARG BEATREALTIME_GA_CLIENT_ID
ARG BEATREALTIME_GA_API_KEY
ARG BEATREALTIME_TRACKING_ID
ADD . /code
WORKDIR /code
ENV BEATREALTIME_GA_CLIENT_ID=$BEATREALTIME_GA_CLIENT_ID
ENV BEATREALTIME_GA_API_KEY=$BEATREALTIME_GA_API_KEY
ENV BEATREALTIME_TRACKING_ID=$BEATREALTIME_TRACKING_ID
RUN npm install
RUN npm run release

FROM nginx:mainline-alpine
LABEL maintainer="alberto@berriart.com"
ARG BEATREALTIME_SSL_CERT_PATH
ARG BEATREALTIME_SSL_KEY_PATH
ENV BEATREALTIME_SSL_CERT_PATH=$BEATREALTIME_SSL_CERT_PATH
ENV BEATREALTIME_SSL_KEY_PATH=$BEATREALTIME_SSL_KEY_PATH
COPY --from=builder /code/dist /usr/share/nginx/html
RUN rm /etc/nginx/nginx.conf
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.default.conf /etc/nginx/conf.d/default.conf
COPY $BEATREALTIME_SSL_CERT_PATH /etc/nginx/ssl/wildcard.berriart.crt
COPY $BEATREALTIME_SSL_KEY_PATH /etc/nginx/ssl/wildcard.berriart.key
COPY ssl/dhparam.pem /etc/nginx/ssl/dhparam.pem
