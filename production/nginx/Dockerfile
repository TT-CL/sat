# Angular
FROM node:15.8.0-alpine3.11 as front-end
WORKDIR /opt/ng
COPY ./front-end/package.json ./
RUN npm install --global npm@6
RUN npm install -g @angular/cli@11.1.4
RUN npm install
RUN npm update

ENV PATH="./node_modules/.bin:$PATH"

COPY ./front-end/. ./

RUN ng build --prod

# nginx
FROM nginx:alpine as prod
COPY nginx.config /etc/nginx/conf.d/default.conf
COPY --from=front-end /opt/ng/dist/summary-eval /usr/share/nginx/html
EXPOSE 80
EXPOSE 443
