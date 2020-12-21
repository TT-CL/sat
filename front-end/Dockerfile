# Angular
FROM node:current-alpine as front-end
WORKDIR /opt/ng
COPY package.json ./
RUN npm update -g
RUN npm install -g @angular/cli@11.0.5
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
