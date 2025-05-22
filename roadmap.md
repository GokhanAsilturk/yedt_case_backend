# Öğrenci ve Ders Yönetimi Uygulaması - Geliştirme Yol Haritası
Backend: Node.js + Express.js
Frontend: React.js + Context API + Material UI
Veritabanı: PostgreSQL
API Dokümantasyonu: Swagger/OpenAPI
Test Framework: Jest + Supertest

## Genel Kurulum ve Hazırlık
- [x] Proje gereksinimlerini analiz etme
- [x] Teknik seçimleri belirleme
- [ ] GitHub repository oluşturma
- [x] Proje yapısını düzenleme
- [ ] Docker ve Docker Compose konfigürasyonu

## Backend (Node.js + Express.js)

### Temel Kurulum
- [x] Express.js projesini oluşturma
- [x] PostgreSQL bağlantısı kurma
- [x] Proje yapısını düzenleme (routes, controllers, models, middlewares)
- [x] Swagger/OpenAPI entegrasyonu

### Veritabanı Modellerinin Oluşturulması
- [x] User modeli (admin ve öğrenci rolleri için)
- [x] Öğrenci modeli
- [x] Ders modeli
- [x] Öğrenci-Ders ilişki modeli

### Kimlik Doğrulama ve Yetkilendirme
- [x] JWT entegrasyonu
- [x] Login/Logout fonksiyonları
- [x] Rol tabanlı yetkilendirme middleware'i
- [x] Kullanıcı oturum yönetimi

### API Endpoint'leri
- [x] Auth endpoint'leri (login, logout, register)
- [x] Öğrenci CRUD endpoint'leri
- [x] Ders CRUD endpoint'leri
- [x] Öğrenci-ders eşleştirme endpoint'leri
- [x] Listeleme ve arama endpoint'leri
- [x] Pagination desteği

### Testler
- [x] Unit testleri (kısmen)
- [x] Integration testleri (kısmen)
- [x] Authentication testleri (kısmen)
- [ ] Yetkilendirme testleri

## Frontend (React.js)

### Temel Kurulum
- [ ] React projesini oluşturma
- [ ] Material UI entegrasyonu
- [ ] Context API ile state management yapısı kurma
- [ ] Routing yapısı (React Router)

### Kimlik Doğrulama Arayüzleri
- [ ] Login sayfası
- [ ] Logout fonksiyonu
- [ ] Protected route yapısı
- [ ] Rol tabanlı erişim kontrolü

### Admin Paneli Arayüzleri
- [ ] Dashboard tasarımı
- [ ] Öğrenci yönetimi sayfaları (liste, ekle, düzenle, sil)
- [ ] Ders yönetimi sayfaları (liste, ekle, düzenle, sil)
- [ ] Öğrenci-ders eşleştirme sayfası

### Öğrenci Arayüzleri
- [ ] Öğrenci profil sayfası
- [ ] Kayıtlı dersler listesi
- [ ] Ders kayıt sayfası
- [ ] Ders kaydı silme fonksiyonu

### Ortak Komponentler
- [ ] Sayfalama (pagination) komponenti
- [ ] Modal/popup komponentleri
- [ ] Form komponentleri
- [ ] Tablo komponentleri
- [ ] Bildirim (notification) komponentleri

## Docker ve Deployment
- [ ] Backend Dockerfile
- [ ] Frontend Dockerfile
- [ ] Docker Compose konfigürasyonu
- [ ] Veritabanı kurulumu ve migrasyonları
- [ ] Lokal geliştirme ortamı talimatları

## Dokümantasyon
- [ ] README dosyası
- [x] API dokümantasyonu (Swagger ile)
- [ ] Kurulum talimatları
- [ ] Proje yapısı açıklaması
- [ ] Örnek kullanım senaryoları

## Proje Tamamlama
- [ ] Kod kalitesi gözden geçirme
- [ ] Güvenlik kontrolü
- [ ] Performans optimizasyonu
- [ ] Son testler
- [ ] Teslim
