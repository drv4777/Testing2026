# Use Node.js LTS version
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies by copying package.json AND package-lock.json
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Your backend runs on port 5000
EXPOSE 5000

# Start the server
CMD [ "npm", "start" ]