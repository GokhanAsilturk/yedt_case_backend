# Authentication API Endpoints

Bu döküman, Öğrenci Yönetim Sistemi Authentication API'sinin tüm endpoint'lerini, parametrelerini ve dönüş tiplerini içermektedir.

## Base URL
```
http://localhost:5000
```

## Authentication
Çoğu endpoint JWT Bearer token ile kimlik doğrulama gerektirir:
```
Authorization: Bearer <token>
```

## Response Formatları

### Başarılı Response
```json
{
  "success": true,
  "message": "Success",
  "data": <data>
}
```

### Hata Response
```json
{
  "success": false,
  "message": "Error message",
  "error": <error_details>
}
```

### Sayfalanmış Response
```json
{
  "success": true,
  "data": [<items>],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

---

## Authentication Endpoints

### POST /api/auth/admin/login
**Açıklama:** Admin girişi  
**Kimlik Doğrulama:** Gerekli değil  

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
- **200:** Admin login successful
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "admin1",
      "email": "admin@example.com",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

- **401:** Invalid credentials
```json
{
  "success": false,
  "message": "Geçersiz kimlik bilgileri.",
  "error": {
    "code": "UNAUTHORIZED"
  }
}
```

---

### POST /api/auth/student/login
**Açıklama:** Öğrenci girişi  
**Kimlik Doğrulama:** Gerekli değil  

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
- **200:** Student login successful
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "userId": "d6903554-614d-4fc9-892a-77b270332112",
      "username": "gokhanasilturk",
      "email": "student@example.com",
      "role": "student"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

- **401:** Invalid credentials
```json
{
  "success": false,
  "message": "Geçersiz kimlik bilgileri.",
  "error": {
    "code": "UNAUTHORIZED"
  }
}
```

---

### POST /api/auth/refresh-token
**Açıklama:** Access token yenileme  
**Kimlik Doğrulama:** Gerekli değil  

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
- **200:** New access token generated
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

- **401:** Invalid or expired refresh token
```json
{
  "success": false,
  "message": "Yetkisiz erişim.",
  "error": {
    "code": "UNAUTHORIZED"
  }
}
```

---

### POST /api/auth/logout
**Açıklama:** Kullanıcı çıkışı  
**Kimlik Doğrulama:** Bearer Token  

**Request Body:**
```json
{
  "refreshToken": "string" // optional
}
```

**Response:**
- **200:** Successfully logged out
```json
{
  "success": true,
  "message": "Başarıyla çıkış yapıldı",
  "data": null
}
```

- **401:** Unauthorized
```json
{
  "success": false,
  "message": "Yetkisiz erişim.",
  "error": {
    "code": "UNAUTHORIZED"
  }
}
```

---

## HTTP Status Codes
- **200:** OK - Başarılı
- **201:** Created - Oluşturuldu
- **400:** Bad Request - Hatalı istek
- **401:** Unauthorized - Kimlik doğrulama gerekli
- **403:** Forbidden - Yetkisiz erişim
- **404:** Not Found - Bulunamadı
- **500:** Internal Server Error - Sunucu hatası

---

## Notlar
- Tüm UUID formatındaki ID'ler UUID v4 formatında olmalıdır
- Tarih formatları ISO 8601 standardında olmalıdır (YYYY-MM-DD)
- Datetime formatları ISO 8601 standardında olmalıdır (YYYY-MM-DDTHH:mm:ss.sssZ)
