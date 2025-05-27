# Error API Endpoints

Bu döküman, Öğrenci Yönetim Sistemi Error API'sinin tüm endpoint'lerini, parametrelerini ve dönüş tiplerini içermektedir.

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

## Error Endpoints

### GET /api/errors
**Açıklama:** Hata loglarını getir  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Query Parameters:**
- `page` (integer, optional): Sayfa numarası
- `limit` (integer, optional): Sayfa başına hata log sayısı

**Response:**
- **200:** Error logs retrieved successfully
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440050",
      "userId": "550e8400-e29b-41d4-a716-446655440001",
      "errorCode": "NOT_FOUND",
      "errorMessage": "Kaynak bulunamadı.",
      "requestPath": "/api/courses/999",
      "requestMethod": "GET",
      "requestPayload": null,
      "stackTrace": "Error: Kurs bulunamadı\n    at CourseController.getCourseById (/app/src/controllers/courseController.ts:45:11)...",
      "errorType": "NOT_FOUND",
      "createdAt": "2024-01-15T11:20:00.000Z",
      "updatedAt": "2024-01-15T11:20:00.000Z"
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

## Additional Endpoints

### GET /
**Açıklama:** API root endpoint  
**Kimlik Doğrulama:** Gerekli değil  

**Response:**
```json
{
  "message": "Student Management System API"
}
```

### GET /api-docs
**Açıklama:** Swagger UI documentation  
**Kimlik Doğrulama:** Gerekli değil  

### GET /swagger.json
**Açıklama:** Swagger JSON specification  
**Kimlik Doğrulama:** Gerekli değil  

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

### Error Log Model
```json
{
  "id": "uuid",
  "userId": "uuid",
  "errorCode": "string",
  "errorMessage": "string",
  "requestPath": "string",
  "requestMethod": "string",
  "requestPayload": "json",
  "stackTrace": "string",
  "errorType": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## Notlar
- Tüm UUID formatındaki ID'ler UUID v4 formatında olmalıdır
- Datetime formatları ISO 8601 standardında olmalıdır (YYYY-MM-DDTHH:mm:ss.sssZ)
