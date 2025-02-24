# Use an official Node.js runtime as a base image
FROM node:20-bookworm AS deployment

# Install necessary build dependencies for canvas
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxrender1 \
    libxshmfence1 \
    xdg-utils \
    ca-certificates \
    gcc-11 \
    g++-11 \
    libstdc++6 && \
    rm -rf /var/lib/apt/lists/*

# Ensure the system uses GCC 11+
RUN update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-11 100 && \
    update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-11 100


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

FROM node:20-bookworm AS mailer-gui

RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxrender1 \
    libxshmfence1 \
    xdg-utils \
    ca-certificates \
    gcc-11 \
    g++-11 \
    libstdc++6 && \
    rm -rf /var/lib/apt/lists/*

# Ensure the system uses GCC 11+
RUN update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-11 100 && \
    update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-11 100

WORKDIR /app
COPY --from=deployment /app/.output ./
EXPOSE 3000
ENV NUST_HOST=0.0.0.0
ENV NUXT_PORT=3000
CMD ["node", "server/index.mjs"]