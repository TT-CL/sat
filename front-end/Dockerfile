# Angular
FROM node:15.8.0-alpine3.11 as front-end
WORKDIR /opt/ng
COPY package.json ./
RUN npm install --global npm@6
RUN npm install -g @angular/cli@11.1.4
RUN npm install

ENV PATH="./node_modules/.bin:$PATH"

COPY . ./

## DEVELOPMENT
RUN ng build

EXPOSE 4201
CMD ["npm", "start"]

## PRODUCTION
#RUN ng build --prod

# nginx
#FROM nginx:alpine
#COPY nginx.config /etc/nginx/conf.d/default.conf
#COPY --from=front-end /opt/ng/dist/summary-eval /usr/share/nginx/html
