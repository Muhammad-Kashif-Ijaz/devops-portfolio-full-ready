FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="Muhammad Kashif DevOps Portfolio"
LABEL org.opencontainers.image.description="Static portfolio website served by Nginx"

RUN addgroup -S portfolio && adduser -S portfolio -G portfolio

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html about.html projects.html skills.html contact.html /usr/share/nginx/html/
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
COPY assets /usr/share/nginx/html/assets
COPY social.png my-second-pic.jpeg whatsapp-brands-solid-full.svg /usr/share/nginx/html/

RUN chown -R portfolio:portfolio /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown portfolio:portfolio /var/run/nginx.pid

USER portfolio

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
