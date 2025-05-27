# Admin API Endpoints

Bu döküman, Öğrenci Yönetim Sistemi Admin API'sinin tüm endpoint'lerini, parametrelerini ve dönüş tiplerini içermektedir.

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

## Admin Endpoints

### GET /api/admins
**Açıklama:** Tüm adminleri listele  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Query Parameters:**
- `page` (integer, optional): Sayfa numarası
- `limit` (integer, optional): Sayfa başına admin sayısı

**Response:**
- **200:** Admin list retrieved successfully (Paginated)
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440030",
      "userId": "550e8400-e29b-41d4-a716-446655440031",
      "firstName": "Admin",
      "lastName": "User",
      "department": "IT",
      "title": "System Administrator",
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-10T08:00:00.000Z",
      "User": {
        "id": "550e8400-e29b-41d4-a716-446655440031",
        "username": "adminuser",
        "email": "admin@example.com",
        "role": "admin"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "pages": 1
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

### GET /api/admins/{id}
**Açıklama:** ID'ye göre admin detaylarını getir  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Path Parameters:**
- `id` (string, required): Admin ID

**Response:**
- **200:** Admin details retrieved successfully
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440030",
    "userId": "550e8400-e29b-41d4-a716-446655440031",
    "firstName": "Admin",
    "lastName": "User",
    "department": "IT",
    "title": "System Administrator",
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-10T08:00:00.000Z",
    "User": {
      "username": "adminuser",
      "email": "admin@example.com"
    }
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

- **404:** Admin not found
```json
{
  "success": false,
  "message": "Admin bulunamadı.",
  "error": {
    "code": "NOT_FOUND"
  }
}
```

---

### POST /api/admins
**Açıklama:** Yeni admin ekle  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "department": "string",
  "title": "string"
}
```

**Response:**
- **201:** Admin created successfully
```json
{
  "success": true,
  "message": "Admin başarıyla oluşturuldu",
  "data": {
    "admin": {
      "id": "550e8400-e29b-41d4-a716-446655440032",
      "userId": "550e8400-e29b-41d4-a716-446655440033",
      "firstName": "Yeni",
      "lastName": "Admin",
      "department": "Eğitim",
      "title": "Eğitim Koordinatörü",
      "createdAt": "2024-01-17T09:00:00.000Z",
      "updatedAt": "2024-01-17T09:00:00.000Z"
    },
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440033",
      "username": "yeniadmin",
      "email": "yeni@admin.com",
      "role": "admin"
    }
  }
}
```

- **400:** Bad Request - Validation error
```json
{
  "success": false,
  "message": "Doğrulama hatası.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "email": "Email alanı geçerli bir email adresi olmalıdır."
    }
  }
}
```

- **409:** Conflict - Username or email already exists
```json
{
  "success": false,
  "message": "Bu kullanıcı adı zaten kullanılıyor",
  "error": {
    "code": "CONFLICT"
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

### PUT /api/admins/{id}
**Açıklama:** Admin detaylarını güncelle  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Path Parameters:**
- `id` (string, required): Admin ID

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "department": "string",
  "title": "string"
}
```

**Response:**
- **200:** Admin updated successfully
```json
{
  "success": true,
  "message": "Admin başarıyla güncellendi",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440030",
    "userId": "550e8400-e29b-41d4-a716-446655440031",
    "firstName": "Güncel",
    "lastName": "Admin",
    "department": "IT Yönetimi",
    "title": "Senior System Administrator",
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-17T10:30:00.000Z"
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

- **404:** Admin not found
```json
{
  "success": false,
  "message": "Admin bulunamadı.",
  "error": {
    "code": "NOT_FOUND"
  }
}
```

---

### DELETE /api/admins/{id}
**Açıklama:** Admin sil  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Path Parameters:**
- `id` (string, required): Admin ID

**Response:**
- **200:** Admin deleted successfully
```json
{
  "success": true,
  "message": "Admin başarıyla silindi",
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

- **404:** Admin not found
```json
{
  "success": false,
  "message": "Admin bulunamadı.",
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

### Admin Model
```json
{
  "id": "uuid",
  "userId": "uuid",
  "firstName": "string",
  "lastName": "string",
  "department": "string",
  "title": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### User Model
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "role": "admin",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## Notlar
- Tüm UUID formatındaki ID'ler UUID v4 formatında olmalıdır
- Datetime formatları ISO 8601 standardında olmalıdır (YYYY-MM-DDTHH:mm:ss.sssZ)
