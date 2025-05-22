# Docker Kurulum ve Kullanım Kılavuzu

Bu doküman, eğitim yönetim sistemi backend uygulamasının Docker ve Docker Compose ile nasıl yapılandırılacağını ve çalıştırılacağını açıklar.

## Gereksinimler

- Docker Engine (sürüm 20.10.0 veya üzeri)
- Docker Compose (sürüm 2.0.0 veya üzeri)

## Hızlı Başlangıç

### Geliştirme Ortamı

Geliştirme ortamını başlatmak için:

```bash
# Konteynerleri oluşturup başlat
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Logları görüntüle
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
```

Bu komut, hot-reload özelliği etkin olarak backend uygulamasını ve PostgreSQL veritabanını başlatır. Ayrıca veritabanı yönetimi için PgAdmin arayüzünü `http://localhost:5050` adresinde kullanıma sunar.

### Üretim Ortamı

Üretim ortamını başlatmak için:

```bash
# Konteynerleri oluşturup başlat
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Logları görüntüle
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```

## Veritabanı İşlemleri

### Veritabanı Tabloları Oluşturma ve Seed Verileri Yükleme

Veritabanı şemasını oluşturmak ve başlangıç verilerini yüklemek için:

```bash
# Geliştirme ortamında
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend sh /app/docker/scripts/db-init.sh

# Üretim ortamında
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend sh /app/docker/scripts/db-init.sh
```

### Manuel Seed İşlemi

Sadece seed verilerini yüklemek için:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend npm run seed
```

### Veritabanı Yedeği Alma

Üretim ortamında, veritabanı yedeği alma servisi otomatik olarak günlük yedekler alır. Manuel olarak yedek almak için:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec postgres-backup sh -c 'pg_dump -h postgres -U $PGUSER $PGDATABASE | gzip > /backups/manual_backup_$(date +%Y%m%d_%H%M%S).sql.gz'
```

## Ortam Değişkenleri

- `.env.development`: Geliştirme ortamı için çevre değişkenleri
- `.env.production`: Üretim ortamı için çevre değişkenleri

**Not**: Üretim ortamında güvenlik için `.env.production` dosyasındaki şifre ve JWT anahtarlarını değiştirmeyi unutmayın.

## Güvenlik Notları

1. Üretim ortamında PostgreSQL portu dış dünyaya açık değildir, sadece backend servisi tarafından erişilebilir.
2. Backend uygulaması, Dockerfile'da tanımlanan root olmayan bir kullanıcı (appuser) tarafından çalıştırılır.
3. JWT anahtarlarını ve veritabanı şifrelerini güçlü, rastgele değerlerle değiştirin.

## Konteyner Yönetimi

### Konteyner Durumunu Kontrol Etme

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps
```

### Konteynerleri Durdurma

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
```

### Logları İzleme

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
```

### Özel Bir Konteyner'in Loglarını İzleme

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend