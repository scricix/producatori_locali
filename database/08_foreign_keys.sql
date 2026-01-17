-- 8. ADĂUGARE FOREIGN KEYS (Relații între tabele)
-- Rulează acestea DUPĂ ce ai creat toate tabelele de mai sus

-- Foreign key pentru products -> users
ALTER TABLE products
ADD CONSTRAINT fk_products_user_email 
FOREIGN KEY (user_email) REFERENCES users(user_email) ON DELETE CASCADE;

-- Foreign key pentru orders -> users
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Foreign key pentru order_items -> orders
ALTER TABLE order_items
ADD CONSTRAINT fk_order_items_order_id 
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- Foreign key pentru order_items -> products
ALTER TABLE order_items
ADD CONSTRAINT fk_order_items_product_id 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Foreign key pentru product_images -> products
ALTER TABLE product_images
ADD CONSTRAINT fk_product_images_product_id 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Foreign key pentru reviews -> products
ALTER TABLE reviews
ADD CONSTRAINT fk_reviews_product_id 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Foreign key pentru reviews -> users
ALTER TABLE reviews
ADD CONSTRAINT fk_reviews_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
