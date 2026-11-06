#!/bin/sh
set -e

mkdir -p /etc/nginx/certs
cd /etc/nginx/certs

if [ ! -s localhost.crt ] || [ ! -s localhost.key ]; then
    openssl req -x509 -noenc \
    -keyout localhost.key -out localhost.crt \
    -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost"
fi

chmod 600 localhost.key
chmod 644 localhost.crt