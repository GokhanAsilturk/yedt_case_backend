-- Veritabanını oluştur (eğer yoksa)
CREATE DATABASE yedt_case;

-- Veritabanına bağlan
\c yedt_case;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Veritabanı kullanıcısına izinler ver
GRANT ALL PRIVILEGES ON DATABASE yedt_case TO postgres;