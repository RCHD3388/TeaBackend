# Menggunakan Node.js sebagai base image
FROM node:18-alpine

# Set working directory di dalam container
WORKDIR /app

# Menyalin package.json dan package-lock.json ke dalam container
COPY package*.json ./

# Install dependencies
RUN npm install

# Menyalin semua file proyek ke dalam container
COPY . .

# Build aplikasi NestJS
RUN npm run build

# Menjalankan aplikasi di dalam container
CMD ["npm", "run", "start:prod"]

# Menyediakan port untuk diakses dari luar container
EXPOSE 3000
