# ---- Build Stage ----
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Jalankan seed dulu, lalu start server
CMD ["sh", "-c", "node seed.js && node server.js"]
