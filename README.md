# Eğitim Yönetim Sistemi API

## Kurulum

### Gereksinimler

- Node.js (v16+)
- Docker ve Docker Compose
- PostgreSQL (Docker ile otomatik kurulum)

### Geliştirme Ortamı Kurulumu

1. Projeyi klonlayın
   ```bash
   git clone https://github.com/GokhanAsilturk/yedt_case_backend
   cd egitim-yonetim-sistemi/backend
   ```

2. Bağımlılıkları yükleyin
   ```bash
   npm install
   ```

3. `.env.development` dosyasını `.env` olarak kopyalayın ve gerekirse düzenleyin
   ```bash
   cp .env.development .env
   ```

4. Docker ile geliştirme ortamını başlatın
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

5. Veritabanını ve ilk verileri oluşturun
   ```bash
   npm run db:init
   npm run seed
   ```

6. Uygulamayı geliştirme modunda başlatın
   ```bash
   npm run dev
   ```

### Dev Ortamı Kurulumu

1. `.env.production` dosyasını `.env` olarak kopyalayın ve düzenleyin
   ```bash
   cp .env.production .env
   ```

2. Docker ile dev ortamını başlatın
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## API Kullanımı

Swagger API dokümantasyonuna şu adres üzerinden erişebilirsiniz:
```
http://localhost:5000/api-docs
```

## Veritabanı Sıfırlama (Reset) Scriptleri

Bu proje, veritabanı tablolarını sıfırlamak için kullanışlı scriptler sunar. Bu scriptler, geliştirme ve test süreçlerinde veritabanını temizlemek için kullanılabilir.

### Kullanım

Sıfırlama scriptlerini kullanmak için aşağıdaki komutları kullanabilirsiniz:

- **Tüm tabloları sıfırlamak için:**
```bash
npm run reset:all
```
- **Belirli bir tabloyu sıfırlamak için:**
```bash
npm run reset:student    # Öğrenci tablosunu sıfırlar
npm run reset:course     # Kurs tablosunu sıfırlar
npm run reset:enrollment # Kayıt tablosunu sıfırlar
npm run reset:user       # Kullanıcı tablosunu sıfırlar
```

**Not:** `npm run reset` komutu, bu kullanım kılavuzunu görüntüler.

## Testler

### Birim Testleri Çalıştırma
```bash
npm run test:unit
```

### Entegrasyon Testleri Çalıştırma
```bash
npm run test:integration
```

### Tüm Testleri Çalıştırma
```bash
npm test
```


## Özellikler

- 🔐 JWT tabanlı kimlik doğrulama ve yetkilendirme
- 👥 Öğrenci yönetimi
- 📚 Kurs yönetimi
- ✅ Kayıt (Enrollment) yönetimi
- 🛡️ Güvenlik önlemleri (XSS koruması, rate limiting)
- 📊 Swagger API dokümantasyonu
- 🐳 Docker ile kolay kurulum ve dağıtım

## Teknoloji Yığını

- **Backend**: Node.js, Express.js, TypeScript
- **Veritabanı**: PostgreSQL
- **Kimlik Doğrulama**: JWT
- **Test**: Jest
- **Dökümantasyon**: Swagger
- **Konteynerizasyon**: Docker, Docker Compose

## Kurulum

### Gereksinimler

- Node.js (v16+)
- Docker ve Docker Compose
- PostgreSQL (Docker ile otomatik kurulum)

### Geliştirme Ortamı Kurulumu

1. Projeyi klonlayın
   ```bash
   git clone https://github.com/GokhanAsilturk/yedt_case_backend
   cd egitim-yonetim-sistemi/backend
   ```

2. Bağımlılıkları yükleyin
   ```bash
   npm install
   ```

3. `.env.development` dosyasını `.env` olarak kopyalayın ve gerekirse düzenleyin
   ```bash
   cp .env.development .env
   ```

4. Docker ile geliştirme ortamını başlatın
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

5. Veritabanını ve ilk verileri oluşturun
   ```bash
   npm run db:init
   npm run seed
   ```

6. Uygulamayı geliştirme modunda başlatın
   ```bash
   npm run dev
   ```

### Dev Ortamı Kurulumu

1. `.env.production` dosyasını `.env` olarak kopyalayın ve düzenleyin
   ```bash
   cp .env.production .env
   ```

2. Docker ile dev ortamını başlatın
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## API Kullanımı

Swagger API dokümantasyonuna şu adres üzerinden erişebilirsiniz:
```
http://localhost:5000/api-docs
```

## Veritabanı Sıfırlama (Reset) Scriptleri

Bu proje, veritabanı tablolarını sıfırlamak için kullanışlı scriptler sunar. Bu scriptler, geliştirme ve test süreçlerinde veritabanını temizlemek için kullanılabilir.

### Kullanım

Sıfırlama scriptlerini kullanmak için aşağıdaki komutları kullanabilirsiniz:

- **Tüm tabloları sıfırlamak için:**
```bash
npm run reset:all
```
- **Belirli bir tabloyu sıfırlamak için:**
```bash
npm run reset:student    # Öğrenci tablosunu sıfırlar
npm run reset:course     # Kurs tablosunu sıfırlar
npm run reset:enrollment # Kayıt tablosunu sıfırlar
npm run reset:user       # Kullanıcı tablosunu sıfırlar
```

**Not:** `npm run reset` komutu, bu kullanım kılavuzunu görüntüler.

## Testler

### Birim Testleri Çalıştırma
```bash
npm run test:unit
```

### Entegrasyon Testleri Çalıştırma
```bash
npm run test:integration
```

### Tüm Testleri Çalıştırma
```bash
npm test
```

## CI/CD

Bu proje, GitHub Actions kullanılarak aşağıdaki CI/CD süreçlerini otomatikleştirir:

- Kod kalitesi ve format kontrolü
- Birim ve entegrasyon testleri
- Build süreci
- Docker imajı oluşturma ve yayınlama
- Farklı ortamlara (development, staging, production) otomatik dağıtım

Detaylı bilgi için `.github/workflows` klasörüne bakabilirsiniz.
