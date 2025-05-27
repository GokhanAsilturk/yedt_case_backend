# Enrollment API Endpoints

Bu döküman, Öğrenci Yönetim Sistemi Enrollment API'sinin tüm endpoint'lerini, parametrelerini ve dönüş tiplerini içermektedir.

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

## Enrollment Endpoints

### POST /api/enrollments/student/courses/{courseId}/enroll
**Açıklama:** Kursa kayıt ol  
**Kimlik Doğrulama:** Bearer Token  

**Path Parameters:**
- `courseId` (string, required): Course ID

**Response:**
- **201:** Enrollment successful
```json
{
  "success": true,
  "message": "Kursa başarıyla kaydoldunuz",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "studentId": "550e8400-e29b-41d4-a716-446655440002",
    "courseId": "550e8400-e29b-41d4-a716-446655440010",
    "enrollmentDate": "2024-01-15T15:00:00.000Z",
    "createdAt": "2024-01-15T15:00:00.000Z",
    "updatedAt": "2024-01-15T15:00:00.000Z"
  }
}
```

- **400:** Bad Request
```json
{
  "success": false,
  "message": "Bu kursa zaten kayıtlısınız",
  "error": {
    "code": "BAD_REQUEST"
  }
}
```

- **404:** Course not found
```json
{
  "success": false,
  "message": "Kurs bulunamadı",
  "error": {
    "code": "NOT_FOUND"
  }
}
```

---

### DELETE /api/enrollments/student/courses/{courseId}/withdraw
**Açıklama:** Kurstan çıkış yap  
**Kimlik Doğrulama:** Bearer Token  

**Path Parameters:**
- `courseId` (string, required): Course ID

**Response:**
- **200:** Withdrawal successful
```json
{
  "success": true,
  "message": "Kurstan başarıyla ayrıldınız",
  "data": null
}
```

- **400:** Bad Request
```json
{
  "success": false,
  "message": "Bu kursa kayıtlı değilsiniz",
  "error": {
    "code": "BAD_REQUEST"
  }
}
```

- **404:** Course not found
```json
{
  "success": false,
  "message": "Kurs bulunamadı",
  "error": {
    "code": "NOT_FOUND"
  }
}
```

---

### GET /api/enrollments
**Açıklama:** Tüm kayıtları listele  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Query Parameters:**
- `page` (integer, optional): Sayfa numarası
- `limit` (integer, optional): Sayfa başına kayıt sayısı

**Response:**
- **200:** Enrollment list retrieved successfully (Paginated)
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "studentId": "550e8400-e29b-41d4-a716-446655440002",
      "courseId": "550e8400-e29b-41d4-a716-446655440010",
      "enrollmentDate": "2024-01-15T15:00:00.000Z",
      "createdAt": "2024-01-15T15:00:00.000Z",
      "updatedAt": "2024-01-15T15:00:00.000Z",
      "Student": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "firstName": "Gökhan",
        "lastName": "Aşiltürk"
      },
      "Course": {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "name": "Matematik 101"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
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

### GET /api/enrollments/students/{id}
**Açıklama:** Öğrencinin kayıtlarını getir  
**Kimlik Doğrulama:** Bearer Token  

**Path Parameters:**
- `id` (string, required): Student ID

**Response:**
- **200:** Student enrollments retrieved successfully
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "studentId": "550e8400-e29b-41d4-a716-446655440002",
      "courseId": "550e8400-e29b-41d4-a716-446655440010",
      "enrollmentDate": "2024-01-15T15:00:00.000Z",
      "createdAt": "2024-01-15T15:00:00.000Z",
      "updatedAt": "2024-01-15T15:00:00.000Z",
      "Course": {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "name": "Matematik 101",
        "description": "Temel matematik dersi"
      }
    }
  ]
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
  "message": "Öğrenci bulunamadı.",
  "error": {
    "code": "NOT_FOUND"
  }
}
```

---

### GET /api/enrollments/courses/{id}
**Açıklama:** Kursun kayıtlarını getir  
**Kimlik Doğrulama:** Bearer Token  

**Path Parameters:**
- `id` (string, required): Course ID

**Response:**
- **200:** Course enrollments retrieved successfully
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "studentId": "550e8400-e29b-41d4-a716-446655440002",
      "courseId": "550e8400-e29b-41d4-a716-446655440010",
      "enrollmentDate": "2024-01-15T15:00:00.000Z",
      "createdAt": "2024-01-15T15:00:00.000Z",
      "updatedAt": "2024-01-15T15:00:00.000Z",
      "Student": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "firstName": "Gökhan",
        "lastName": "Asiltürk",
        "User": {
          "username": "gokhanasilturk",
          "email": "gokhanasilturkk@gmail.com"
        }
      }
    }
  ]
}
```

- **404:** Course not found
```json
{
  "success": false,
  "message": "Kurs bulunamadı.",
  "error": {
    "code": "NOT_FOUND"
  }
}
```

---

### POST /api/enrollments
**Açıklama:** Yeni kayıt oluştur  
**Kimlik Doğrulama:** Bearer Token (Admin only) 

**Request Body:**
```json
{
  "studentId": "string",
  "courseId": "string"
}
```

**Response:**
- **201:** Enrollment created successfully
```json
{
  "success": true,
  "message": "Kayıt başarıyla oluşturuldu",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440021",
    "studentId": "550e8400-e29b-41d4-a716-446655440003",
    "courseId": "550e8400-e29b-41d4-a716-446655440010",
    "enrollmentDate": "2024-01-16T10:00:00.000Z",
    "createdAt": "2024-01-16T10:00:00.000Z", 
    "updatedAt": "2024-01-16T10:00:00.000Z"
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
      "studentId": "Öğrenci ID alanı zorunludur."
    }
  }
}
```

- **409:** Conflict - Student already enrolled
```json
{
  "success": false,
  "message": "Bu öğrenci zaten bu kursa kayıtlı",
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

### DELETE /api/enrollments/{id}
**Açıklama:** Kayıt sil  
**Kimlik Doğrulama:** Bearer Token (Admin only)

**Path Parameters:**
- `id` (string, required): Enrollment ID

**Response:**
- **200:** Enrollment deleted successfully
```json
{
  "success": true,
  "message": "Kayıt başarıyla silindi",
  "data": null
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

- **404:** Enrollment not found
```json
{
  "success": false,
  "message": "Kayıt bulunamadı.",
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

### Enrollment Model
```json
{
  "id": "uuid",
  "studentId": "uuid",
  "courseId": "uuid",
  "enrollmentDate": "datetime",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## Notlar
- Tüm UUID formatındaki ID'ler UUID v4 formatında olmalıdır
- Datetime formatları ISO 8601 standardında olmalıdır (YYYY-MM-DDTHH:mm:ss.sssZ)
