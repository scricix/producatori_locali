-- 9. DATE DE TEST (Opțional - pentru testare)

-- Inserare utilizator admin
INSERT INTO users (first_name, last_name, user_email, phone, password, role, created_at) VALUES
('Admin', 'Platform', 'admin@producatori.ro', '0722000000', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NOW());
-- Parola: password

-- Inserare utilizator producător de test
INSERT INTO users (first_name, last_name, user_email, phone, password, role, business_name, description, county, city, created_at) VALUES
('Ion', 'Popescu', 'ion.popescu@email.ro', '0722111111', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'producer', 'Ferma Popescu', 'Producător local de legume bio', 'Timiș', 'Timișoara', NOW());
-- Parola: password

-- Inserare utilizator client de test
INSERT INTO users (first_name, last_name, user_email, phone, password, role, created_at) VALUES
('Maria', 'Ionescu', 'maria.ionescu@email.ro', '0722222222', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', NOW());
-- Parola: password

-- Inserare produse de test
INSERT INTO products (product_name, description, price, unit, stock_quantity, category, producer_name, producer_phone, county, city, image_path, user_email, created_at) VALUES
('Roșii Cherry Bio', 'Roșii cherry cultivate natural, fără pesticide. Proaspete și aromate.', 15.00, 'kg', 50, 'legume', 'Ion Popescu', '0722111111', 'Timiș', 'Timișoara', NULL, 'ion.popescu@email.ro', NOW()),
('Castraveți de Seră', 'Castraveți proaspeți, crocanti, ideali pentru salate.', 8.50, 'kg', 30, 'legume', 'Ion Popescu', '0722111111', 'Timiș', 'Timișoara', NULL, 'ion.popescu@email.ro', NOW()),
('Miere de Salcâm', 'Miere pură de salcâm, recoltată în zonele curate ale județului.', 45.00, 'kg', 20, 'miere', 'Ion Popescu', '0722111111', 'Timiș', 'Timișoara', NULL, 'ion.popescu@email.ro', NOW());
