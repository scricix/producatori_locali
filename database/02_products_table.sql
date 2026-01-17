-- 2. ACTUALIZARE TABEL PRODUCTS (Produse - compatibil cu schema existentă)
-- Dacă tabelul products există deja, această comandă va adăuga doar coloanele lipsă
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_quantity INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS badge VARCHAR(50),
ADD INDEX IF NOT EXISTS idx_category (category),
ADD INDEX IF NOT EXISTS idx_user_email (user_email);

-- Dacă vrei să creezi tabelul de la zero (ATENȚIE: șterge datele existente!)
-- Decomentează comenzile de mai jos doar dacă vrei să recreezi tabelul complet:

/*
DROP TABLE IF EXISTS products;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'bucată',
    stock_quantity INT DEFAULT 0,
    category VARCHAR(100),
    badge VARCHAR(50),
    producer_name VARCHAR(255),
    producer_phone VARCHAR(20),
    county VARCHAR(100),
    city VARCHAR(100),
    image_path VARCHAR(500),
    user_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_user_email (user_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
*/
