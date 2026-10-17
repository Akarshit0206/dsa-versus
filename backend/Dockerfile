FROM node:20-bookworm-slim

# Install Python 3, Java (OpenJDK), and C++ (g++)
RUN apt-get update && apt-get install -y \
    python3 \
    default-jdk \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first for efficient layer caching
COPY package*.json ./
RUN npm ci

# Copy full source
COPY . .

# Compile TypeScript
RUN npm run build

# Expose server port
EXPOSE 3000

# Run production server
CMD ["npm", "start"]
