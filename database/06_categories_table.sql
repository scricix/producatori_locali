-- 6. TABEL CATEGORIES (Categorii de produse)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserare categorii default
INSERT IGNORE INTO categories (name, slug, icon) VALUES
('Legume', 'legume', 'fa-carrot'),
('Fructe', 'fructe', 'fa-apple-alt'),
('Lactate', 'lactate', 'fa-cheese'),
('Miere', 'miere', 'fa-archive'),
('Panificație', 'panificatie', 'fa-bread-slice'),
('Carne', 'carne', 'fa-drumstick-bite'),
('Altele', 'altele', 'fa-box');
