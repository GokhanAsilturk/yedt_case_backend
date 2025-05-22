# Backend Uygulama Mimarisi ve Yapısı

## Proje Yapısı
```
backend/
├── src/
│   ├── config/                # Konfigürasyon dosyaları
│   │   ├── database.js        # Veritabanı bağlantı konfigürasyonu
│   │   └── swagger.js         # Swagger konfigürasyonu
│   ├── controllers/           # İş mantığını içeren controller'lar
│   │   ├── authController.js  # Kimlik doğrulama işlemleri
│   │   ├── courseController.js # Ders CRUD işlemleri
│   │   ├── studentController.js # Öğrenci CRUD işlemleri
│   │   └── enrollmentController.js # Ders kaydı işlemleri
│   ├── middleware/            # Middleware'ler
│   │   ├── auth.js            # JWT doğrulama
│   │   ├── roleCheck.js       # Rol kontrolü
│   │   └── errorHandler.js    # Hata yakalama middleware'i
│   ├── models/                # Veritabanı modelleri
│   │   ├── User.js            # Kullanıcı modeli
│   │   ├── Student.js         # Öğrenci modeli
│   │   ├── Course.js          # Ders modeli
│   │   └── Enrollment.js      # Öğrenci-Ders ilişki modeli
│   ├── routes/                # API endpoint tanımlamaları
│   │   ├── auth.js            # Auth endpointleri
│   │   ├── courses.js         # Ders endpointleri
│   │   ├── students.js        # Öğrenci endpointleri
│   │   ├── enrollments.js     # Kayıt endpointleri
│   │   └── index.js           # Ana router
│   ├── utils/                 # Yardımcı fonksiyonlar
│   │   ├── jwtUtils.js        # JWT helper fonksiyonları
│   │   └── validators.js      # Validation fonksiyonları
│   ├── tests/                 # Test dosyaları
│   │   ├── unit/              # Unit testler
│   │   └── integration/       # Integration testler
│   └── app.js                 # Ana Express uygulaması
├── .env                       # Ortam değişkenleri
├── .gitignore                 # Git ignore dosyası
├── Dockerfile                 # Backend için Dockerfile
├── package.json               # Bağımlılıklar ve scriptler
└── README.md                  # Backend dökümantasyonu
```

## Veritabanı Şeması

### User Tablosu
- id: UUID (Primary Key)
- username: String (Unique)
- email: String (Unique)
- password: String (Hashed)
- role: Enum ('admin', 'student')
- createdAt: DateTime
- updatedAt: DateTime

### Student Tablosu
- id: UUID (Primary Key)
- userId: UUID (Foreign Key -> User.id)
- firstName: String
- lastName: String
- birthDate: Date
- createdAt: DateTime
- updatedAt: DateTime

### Course Tablosu
- id: UUID (Primary Key)
- name: String (Unique)
- description: Text
- createdAt: DateTime
- updatedAt: DateTime

### Enrollment Tablosu (Öğrenci-Ders İlişkisi)
- id: UUID (Primary Key)
- studentId: UUID (Foreign Key -> Student.id)
- courseId: UUID (Foreign Key -> Course.id)
- enrollmentDate: DateTime
- createdAt: DateTime
- updatedAt: DateTime

## API Endpoint'leri

### Authentication
- POST /api/auth/login - Kullanıcı girişi
- POST /api/auth/logout - Çıkış işlemi

### Öğrenci Yönetimi
- GET /api/students - Tüm öğrencileri listele (pagination destekli)
- GET /api/students/:id - Tek bir öğrencinin detaylarını getir
- POST /api/students - Yeni öğrenci ekle
- PUT /api/students/:id - Öğrenci bilgilerini güncelle
- DELETE /api/students/:id - Öğrenci kaydını sil

### Ders Yönetimi
- GET /api/courses - Tüm dersleri listele (pagination destekli)
- GET /api/courses/:id - Tek bir dersin detaylarını getir
- POST /api/courses - Yeni ders ekle
- PUT /api/courses/:id - Ders bilgilerini güncelle
- DELETE /api/courses/:id - Ders kaydını sil

### Öğrenci-Ders Kayıt İşlemleri
- GET /api/enrollments - Tüm kayıtları listele (Admin için, pagination destekli)
- GET /api/students/:id/courses - Bir öğrencinin kayıtlı olduğu tüm dersleri getir
- GET /api/courses/:id/students - Bir derse kayıtlı tüm öğrencileri getir
- POST /api/enrollments - Yeni kayıt ekle (Admin veya öğrencinin kendisi için)
- DELETE /api/enrollments/:id - Kayıt sil (Admin veya öğrencinin kendisi için)