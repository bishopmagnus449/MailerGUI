# Use an official Node.js runtime as a base image
FROM node:20-alpine AS deployment

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
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the reset of application
COPY . .

# Build the application
RUN npm run build

FROM node:20-alpine AS mailer-gui

RUN apk add --no-cache cairo \
    cairo-dev \
    pango-dev \
    giflib-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    cairo \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

WORKDIR /app
COPY --from=deployment /app/.output ./
EXPOSE 3000
ENV NUST_HOST=0.0.0.0
ENV NUXT_PORT=3000
CMD ["node", "server/index.mjs"]