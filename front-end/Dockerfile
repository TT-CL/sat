# Angular
FROM node:15.4.0-alpine3.10 as front-end
WORKDIR /opt/ng
COPY package.json ./
RUN npm install -g @angular/cli@11.0.1
RUN npm install --force

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
