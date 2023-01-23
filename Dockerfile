FROM node:alpine AS messenger-ui
WORKDIR /app
COPY / ./
COPY package*.json ./

RUN npm install -g @angular/cli@15.1.2 && \
    npm install && \
    ng build
COPY . .
