#!/bin/sh
CERT_PATH="/etc/letsencrypt/live/www.tapalqueapp.com.ar/fullchain.pem"

if [ -f "$CERT_PATH" ]; then
    echo "[nginx-proxy] Certificado SSL encontrado, usando config SSL"
    cp /etc/nginx/nginx-ssl.conf /etc/nginx/conf.d/default.conf
else
    echo "[nginx-proxy] Sin certificado SSL, usando config HTTP-only"
    cp /etc/nginx/nginx-init.conf /etc/nginx/conf.d/default.conf
fi

exec nginx -g 'daemon off;'
