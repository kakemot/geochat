# Dockerfile
FROM node:19-alpine

# create destination directory
RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app

# update and install dependency
RUN apk update && apk upgrade
RUN apk add git

# copy the app, note .dockerignore
COPY . /usr/src/nuxt-app/
RUN npm install
RUN npm run build

EXPOSE 8080
EXPOSE 8081
EXPOSE 10000
ENV HOST '0.0.0.0'
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=8080

CMD [ "npm", "start" ]
