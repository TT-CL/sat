# Angular
FROM node:15.8.0-alpine3.11 as front-end
WORKDIR /opt/ng
COPY package.json ./
RUN npm install --global npm@6
RUN npm install -g @angular/cli@11.1.4
RUN npm install
RUN npm update

ENV PATH="./node_modules/.bin:$PATH"

COPY . ./

## DEVELOPMENT stage
FROM front-end as dev
RUN npm i --only=dev
RUN ng build

EXPOSE 4201
CMD ["npm", "start"]

## PRODUCTION
FROM front-end as builder
RUN ng build --prod

# nginx
FROM nginx:alpine as prod
COPY nginx.config /etc/nginx/conf.d/default.conf
COPY --from=builder /opt/ng/dist/summary-eval /usr/share/nginx/html
EXPOSE 80
