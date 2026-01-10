FROM node:20-alpine

# Working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "dist/index.js"]

#Start Docker
#docker build -t edugrant-server .
#docker run -p 4000:4000 --env-file .env edugrant-server