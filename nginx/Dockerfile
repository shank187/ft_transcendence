FROM nginx:stable-alpine

RUN apk add --no-cache openssl

COPY generate-certs.sh /docker-entrypoint.d/40-generate-certs.sh

RUN chmod +x /docker-entrypoint.d/40-generate-certs.sh