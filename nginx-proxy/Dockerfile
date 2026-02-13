FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx-ssl.conf
COPY nginx-init.conf /etc/nginx/nginx-init.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80 443
ENTRYPOINT ["/entrypoint.sh"]
