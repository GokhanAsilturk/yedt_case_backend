# Course API Endpoints

Bu döküman, Öğrenci Yönetim Sistemi Course API'sinin tüm endpoint'lerini, parametrelerini ve dönüş tiplerini içermektedir.

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

## Course Endpoints

### GET /api/courses
**Açıklama:** Tüm kursları listele  
**Kimlik Doğrulama:** Bearer Token  

**Query Parameters:**
- `page` (integer, default: 1): Sayfa numarası
- `limit` (integer, default: 10): Sayfa başına kurs sayısı

**Response:**
- **200:** List of courses (Paginated)

**Response Data:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

---

### GET /api/courses/{id}
**Açıklama:** ID'ye göre kurs detaylarını getir  
**Kimlik Doğrulama:** Bearer Token  

**Path Parameters:**
- `id` (string, required): Course ID (UUID format)

**Response:**
- **200:** Course details
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

- **404:** Course not found
```json
{
  "success": false,
  "message": "Kaynak bulunamadı.",
  "error": {
    "code": "NOT_FOUND"
  }
}
```

---

### POST /api/courses
**Açıklama:** Yeni kurs ekle  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Request Body:**
```json
{
  "name": "string",
  "description": "string" // optional
}
```

**Response:**
- **201:** Course created successfully
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "name": "Matematik 101",
    "description": "Temel matematik dersi",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
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

- **403:** Forbidden - Admin access required
```json
{
  "success": false,
  "message": "Bu kaynağa erişim izniniz yok.",
  "error": {
    "code": "FORBIDDEN"
  }
}
```

---

### PUT /api/courses/{id}
**Açıklama:** Kurs detaylarını güncelle  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Path Parameters:**
- `id` (string, required): Course ID (UUID format)

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

**Response:**
- **200:** Course updated successfully
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "name": "Matematik 102 Güncel",
    "description": "Gelişmiş matematik dersi",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T10:30:00.000Z"
  }
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

- **403:** Forbidden - Admin access required
```json
{
  "success": false,
  "message": "Bu kaynağa erişim izniniz yok.",
  "error": {
    "code": "FORBIDDEN"
  }
}
```

- **404:** Course not found
```json
{
  "success": false,
  "message": "Kaynak bulunamadı.",
  "error": {
    "code": "NOT_FOUND"
  }
}
```

---

### DELETE /api/courses/{id}
**Açıklama:** Kurs sil  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Path Parameters:**
- `id` (string, required): Course ID (UUID format)

**Response:**
- **200:** Course deleted successfully
```json
{
  "success": true,
  "message": "Kurs başarıyla silindi",
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

- **403:** Forbidden - Admin access required
```json
{
  "success": false,
  "message": "Bu kaynağa erişim izniniz yok.",
  "error": {
    "code": "FORBIDDEN"
  }
}
```

- **404:** Course not found
```json
{
  "success": false,
  "message": "Kaynak bulunamadı.",
  "error": {
    "code": "NOT_FOUND"
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

## Data Models

### Course Model
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## Notlar
- Tüm UUID formatındaki ID'ler UUID v4 formatında olmalıdır
- Datetime formatları ISO 8601 standardında olmalıdır (YYYY-MM-DDTHH:mm:ss.sssZ)
