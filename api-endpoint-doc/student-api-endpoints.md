# Student API Endpoints

Bu döküman, Öğrenci Yönetim Sistemi Student API'sinin tüm endpoint'lerini, parametrelerini ve dönüş tiplerini içermektedir.

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

## Student Endpoints

### GET /api/students
**Açıklama:** Tüm öğrencileri listele  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Query Parameters:**
- `page` (integer, optional): Sayfa numarası
- `limit` (integer, optional): Sayfa başına öğrenci sayısı

**Response:**
- **200:** Student list retrieved successfully (Paginated)
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "userId": "550e8400-e29b-41d4-a716-446655440001",
      "firstName": "Gökhan",
      "lastName": "Aşiltürk",
      "birthDate": "1995-05-15",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "User": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "username": "gokhanasilturk",
        "email": "gokhan@example.com",
        "role": "student"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
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

### GET /api/students/{id}
**Açıklama:** ID'ye göre öğrenci detaylarını getir  
**Kimlik Doğrulama:** Bearer Token  

**Path Parameters:**
- `id` (string, required): Student ID

**Response:**
- **200:** Student details retrieved successfully
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "firstName": "Gökhan",
    "lastName": "Aşiltürk",
    "birthDate": "1995-05-15",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

- **403:** Bu öğrenci bilgilerine erişim yetkiniz bulunmamaktadır
```json
{
  "success": false,
  "message": "Bu öğrenci bilgilerine erişim yetkiniz bulunmamaktadır",
  "error": {
    "code": "FORBIDDEN"
  }
}
```

- **404:** Student not found
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

### POST /api/students
**Açıklama:** Yeni öğrenci ekle  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "birthDate": "string (YYYY-MM-DD)"
}
```

**Response:**
- **201:** Student created successfully
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "student": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "userId": "550e8400-e29b-41d4-a716-446655440004",
      "firstName": "Ahmet",
      "lastName": "Yılmaz",
      "birthDate": "1998-03-20",
      "createdAt": "2024-01-15T11:30:00.000Z",
      "updatedAt": "2024-01-15T11:30:00.000Z"
    },
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "username": "ahmetyilmaz",
      "email": "ahmet@example.com",
      "role": "student"
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

---

### PUT /api/students/{id}
**Açıklama:** Öğrenci detaylarını güncelle  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Path Parameters:**
- `id` (string, required): Student ID

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "birthDate": "string (YYYY-MM-DD)"
}
```

**Response:**
- **200:** Student updated successfully
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "firstName": "Gökhan Güncel",
    "lastName": "Aşiltürk",
    "birthDate": "1995-05-15",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:45:00.000Z"
  }
}
```

- **404:** Student not found
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

### DELETE /api/students/{id}
**Açıklama:** Öğrenci sil  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Path Parameters:**
- `id` (string, required): Student ID

**Response:**
- **200:** Student deleted successfully
```json
{
  "success": true,
  "message": "Öğrenci başarıyla silindi",
  "data": null
}
```

- **404:** Student not found
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

### PUT /api/students/profile
**Açıklama:** Öğrenci profil güncelleme (Sadece kendi profili)  
**Kimlik Doğrulama:** Bearer Token (Student only)  

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "birthDate": "string (YYYY-MM-DD)"
}
```

**Response:**
- **200:** Profile updated successfully
```json
{
  "success": true,
  "message": "Profil başarıyla güncellendi",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "firstName": "Gökhan Güncel",
    "lastName": "Aşiltürk Güncel",
    "birthDate": "1995-05-15",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T13:15:00.000Z"
  }
}
```

- **403:** Bu işlem sadece öğrenciler tarafından yapılabilir
```json
{
  "success": false,
  "message": "Bu işlem sadece öğrenciler tarafından yapılabilir",
  "error": {
    "code": "FORBIDDEN"
  }
}
```

- **404:** Student not found
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

### Student Model
```json
{
  "id": "uuid",
  "userId": "uuid",
  "firstName": "string",
  "lastName": "string",
  "birthDate": "date",
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
  "role": "student|admin",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## Notlar
- Tüm UUID formatındaki ID'ler UUID v4 formatında olmalıdır
- Tarih formatları ISO 8601 standardında olmalıdır (YYYY-MM-DD)
- Datetime formatları ISO 8601 standardında olmalıdır (YYYY-MM-DDTHH:mm:ss.sssZ)
