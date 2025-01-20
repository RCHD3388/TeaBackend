# Gunakan base image Node.js
FROM node:18-alpine

# Direktori kerja dalam container
WORKDIR /app

# Salin file package.json dan package-lock.json
COPY package.json package-lock.json ./

# Install dependencies produksi
RUN npm install

# Salin seluruh source code ke container
COPY . .

# Build aplikasi untuk produksi
RUN npm run build

# Expose port backend
EXPOSE 3000

# Jalankan aplikasi dalam mode produksi
CMD ["npm", "run", "start:prod"]