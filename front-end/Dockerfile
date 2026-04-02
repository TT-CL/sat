# Angular
FROM node:24.14-alpine3.22 AS front-end
WORKDIR /opt/ng
COPY package.json /opt/ng
#RUN npm update
RUN npm install
RUN npm install -g @angular/cli@21
# RUN npm update

ENV PATH="./node_modules/.bin:$PATH"

COPY . .

## DEVELOPMENT stage
FROM front-end AS dev
RUN ng build

EXPOSE 4201
CMD ["npm", "start"]

## PRODUCTION
FROM front-end AS builder
#Copy any changes made in production
COPY . .
RUN ng build --configuration production

# nginx
FROM nginx:alpine AS prod
COPY nginx.config /etc/nginx/conf.d/default.conf
COPY --from=builder /opt/ng/dist/sat /usr/share/nginx/html
EXPOSE 80
