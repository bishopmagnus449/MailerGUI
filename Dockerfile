# Use an official Node.js runtime as a base image
FROM node:23-alpine

# Install necessary build dependencies for canvas
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    giflib-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose the port Nuxt will run on
EXPOSE 3000

# Start the Nuxt app
CMD ["npm", "run", "preview"]
