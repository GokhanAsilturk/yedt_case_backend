# Student Management System API Endpoints

Bu döküman, Öğrenci Yönetim Sistemi API'sinin tüm endpoint'lerini, parametrelerini ve dönüş tiplerini içermektedir.

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
- **401:** Invalid credentials

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
- **401:** Invalid credentials

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
- **401:** Invalid or expired refresh token

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
- **401:** Unauthorized

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

---

### GET /api/students/{id}
**Açıklama:** ID'ye göre öğrenci detaylarını getir  
**Kimlik Doğrulama:** Bearer Token  

**Path Parameters:**
- `id` (string, required): Student ID

**Response:**
- **200:** Student details retrieved successfully
- **403:** Bu öğrenci bilgilerine erişim yetkiniz bulunmamaktadır
- **404:** Student not found

**Response Data:**
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
- **404:** Student not found

---

### DELETE /api/students/{id}
**Açıklama:** Öğrenci sil  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Path Parameters:**
- `id` (string, required): Student ID

**Response:**
- **200:** Student deleted successfully
- **404:** Student not found

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
- **403:** Bu işlem sadece öğrenciler tarafından yapılabilir
- **404:** Student not found

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
- **404:** Course not found

**Response Data:**
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
- **401:** Unauthorized
- **403:** Forbidden - Admin access required

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
- **401:** Unauthorized
- **403:** Forbidden - Admin access required
- **404:** Course not found

---

### DELETE /api/courses/{id}
**Açıklama:** Kurs sil  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Path Parameters:**
- `id` (string, required): Course ID (UUID format)

**Response:**
- **200:** Course deleted successfully
- **401:** Unauthorized
- **403:** Forbidden - Admin access required
- **404:** Course not found

---

## Enrollment Endpoints

### POST /api/enrollments/student/courses/{courseId}/enroll
**Açıklama:** Kursa kayıt ol  
**Kimlik Doğrulama:** Bearer Token  

**Path Parameters:**
- `courseId` (string, required): Course ID

**Response:**
- **201:** Enrollment successful

---

### DELETE /api/enrollments/student/courses/{courseId}/withdraw
**Açıklama:** Kurstan çıkış yap  
**Kimlik Doğrulama:** Bearer Token  

**Path Parameters:**
- `courseId` (string, required): Course ID

**Response:**
- **200:** Withdrawal successful

---

### GET /api/enrollments
**Açıklama:** Tüm kayıtları listele  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Query Parameters:**
- `page` (integer, optional): Sayfa numarası
- `limit` (integer, optional): Sayfa başına kayıt sayısı

**Response:**
- **200:** Enrollment list retrieved successfully (Paginated)

---

### GET /api/enrollments/students/{id}
**Açıklama:** Öğrencinin kayıtlarını getir  
**Kimlik Doğrulama:** Bearer Token  

**Path Parameters:**
- `id` (string, required): Student ID

**Response:**
- **200:** Student enrollments retrieved successfully

---

### GET /api/enrollments/courses/{id}
**Açıklama:** Kursun kayıtlarını getir  
**Kimlik Doğrulama:** Bearer Token  

**Path Parameters:**
- `id` (string, required): Course ID

**Response:**
- **200:** Course enrollments retrieved successfully

---

### POST /api/enrollments
**Açıklama:** Yeni kayıt oluştur  
**Kimlik Doğrulama:** Bearer Token  

**Request Body:**
```json
{
  "studentId": "string",
  "courseId": "string"
}
```

**Response:**
- **201:** Enrollment created successfully

---

### DELETE /api/enrollments/{id}
**Açıklama:** Kayıt sil  
**Kimlik Doğrulama:** Bearer Token  

**Path Parameters:**
- `id` (string, required): Enrollment ID

**Response:**
- **200:** Enrollment deleted successfully

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

---

### GET /api/admins/{id}
**Açıklama:** ID'ye göre admin detaylarını getir  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Path Parameters:**
- `id` (string, required): Admin ID

**Response:**
- **200:** Admin details retrieved successfully
- **404:** Admin not found

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
- **404:** Admin not found

---

### DELETE /api/admins/{id}
**Açıklama:** Admin sil  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Path Parameters:**
- `id` (string, required): Admin ID

**Response:**
- **200:** Admin deleted successfully
- **404:** Admin not found

---

## Error Endpoints

### GET /api/errors
**Açıklama:** Hata loglarını getir  
**Kimlik Doğrulama:** Bearer Token (Admin only)  

**Response:**
- **200:** Error logs retrieved successfully

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
  "role": "student|admin",
  "createdAt": "datetime",
  "updatedAt": "datetime"
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
- Sayfalama parametreleri pozitif tamsayı olmalıdır
- Admin yetkileri gerektiren endpoint'ler için Bearer token'da admin rolü olmalıdır
