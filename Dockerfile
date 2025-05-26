# ===== BUILD AŞAMASI =====
FROM node:20.12.2-alpine3.19 AS builder

# Çalışma dizinini ayarla
WORKDIR /app

# Bağımlılıkları önbelleğe almak için package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci

# Kaynak kodlarını kopyala
COPY . .

# TypeScript kodu derle
RUN npm run build

# ===== PRODUCTION AŞAMASI =====
FROM node:20.12.2-alpine3.19 AS production

# Çalışma dizini
WORKDIR /app

# Sadece üretim bağımlılıklarını yükle
COPY package*.json ./
# Disable husky and other scripts during install
ENV npm_config_ignore_scripts=true
RUN npm ci --only=production

# Derleme aşamasından derlenen dosyaları kopyala
COPY --from=builder /app/dist ./dist

# Üretim ortamı değişkenlerini ayarla
ENV NODE_ENV=production

# Uygulama kullanıcısı oluştur ve izinleri ayarla (güvenlik için)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Konteyner çalıştığında çalıştırılacak komut
CMD ["node", "dist/server.js"]

# ===== DEVELOPMENT AŞAMASI =====
FROM node:20.12.2-alpine3.19 AS development

# Çalışma dizini
WORKDIR /app

# Tüm bağımlılıkları yükle (dev bağımlılıkları dahil)
COPY package*.json ./
RUN npm install

# Kaynak kodlarını kopyala
COPY . .

# Geliştirme ortamı değişkenlerini ayarla
ENV NODE_ENV=development

# Konteyner çalıştığında çalıştırılacak komut
CMD ["npm", "run", "dev"]