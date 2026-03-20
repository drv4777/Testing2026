# Use Node.js LTS version
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

ENV NODE_OPTIONS=--openssl-legacy-provider

# React usually runs on 3000
EXPOSE 3000

# Start the frontend
CMD [ "npm", "start" ]