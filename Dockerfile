# ====== Stage 1: Build React App ======
FROM node:20-alpine AS builder

WORKDIR /app

# Menerima VITE_API_URL sebagai build argument
# Karena Vite menginline env variable saat build
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

# Copy package files dan install dependencies
COPY package*.json ./
RUN npm install

# Copy semua source code
COPY . .

# Build production
RUN npm run build

# ====== Stage 2: Serve dengan Nginx ======
FROM nginx:alpine

# Hapus default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy hasil build React ke folder nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
