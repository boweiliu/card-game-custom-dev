# Use the official Node.js image as the base image
FROM node:20

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001
ENV NODE_ENV=production
CMD ["npm", "run", "prod:be"]
