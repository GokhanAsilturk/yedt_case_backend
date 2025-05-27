# API Endpoints Index

Bu döküman, Öğrenci Yönetim Sistemi API'sinin tüm endpoint'lerine genel bakış sunmaktadır. Her bir controller için detaylı dokümantasyona aşağıdaki linklerden erişilebilir.

## Controller-based API Documentation

1. [Auth API Endpoints](./auth-api-endpoints.md) - Kimlik doğrulama ve yetkilendirme
2. [Student API Endpoints](./student-api-endpoints.md) - Öğrenci yönetimi
3. [Course API Endpoints](./course-api-endpoints.md) - Kurs yönetimi
4. [Enrollment API Endpoints](./enrollment-api-endpoints.md) - Kayıt yönetimi
5. [Admin API Endpoints](./admin-api-endpoints.md) - Admin yönetimi
6. [Error API Endpoints](./error-api-endpoints.md) - Hata logları ve API bilgileri

## Base URL
```
http://localhost:5000
```

## Authentication
Çoğu endpoint JWT Bearer token ile kimlik doğrulama gerektirir:
```
Authorization: Bearer <token>
```

## Genel Response Formatları

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

## HTTP Status Codes
- **200:** OK - Başarılı
- **201:** Created - Oluşturuldu
- **400:** Bad Request - Hatalı istek
- **401:** Unauthorized - Kimlik doğrulama gerekli
- **403:** Forbidden - Yetkisiz erişim
- **404:** Not Found - Bulunamadı
- **500:** Internal Server Error - Sunucu hatası

## Veri Modelleri

Tüm controller dokümantasyonlarında ilgili veri modelleri detaylı olarak açıklanmıştır.

## Notlar
- Tüm UUID formatındaki ID'ler UUID v4 formatında olmalıdır
- Tarih formatları ISO 8601 standardında olmalıdır (YYYY-MM-DD)
- Datetime formatları ISO 8601 standardında olmalıdır (YYYY-MM-DDTHH:mm:ss.sssZ)
- Sayfalama parametreleri pozitif tamsayı olmalıdır
- Admin yetkileri gerektiren endpoint'ler için Bearer token'da admin rolü olmalıdır
