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
      "id": "",
      "username": "gokhanasilturk",
      "email": "gokhanasilturkk@gmail.com",
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
        "lastName": "Aşiltürk",
        "User": {
          "username": "gokhanasilturk",
          "email": "gokhan@example.com"
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
