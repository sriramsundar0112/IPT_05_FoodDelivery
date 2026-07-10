#!/bin/sh

sed -i "s|__BACKEND_URL__|$BACKEND_URL|g" \
/usr/share/nginx/html/config.js

exec nginx -g "daemon off;"