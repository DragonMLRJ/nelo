-- Migration: Create Categories Table and Update Products
-- Description: Add categories table with hierarchical support and update products to use category_id

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id INT NULL,
    icon VARCHAR(50),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_slug (slug),
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert main categories
INSERT INTO categories (name, slug, icon, display_order) VALUES
('Women', 'women', 'shirt', 1),
('Men', 'men', 'user', 2),
('Kids', 'kids', 'baby', 3),
('Home & Garden', 'home', 'home', 4),
('Electronics', 'tech', 'smartphone', 5),
('Entertainment', 'ent', 'gamepad-2', 6),
('Beauty & Health', 'beauty', 'sparkles', 7),
('Vehicles', 'vehicles', 'car', 8),
('Real Estate', 'real-estate', 'building', 9),
('Sports & Outdoors', 'sports', 'dumbbell', 10);

-- Insert subcategories for Electronics
INSERT INTO categories (name, slug, parent_id, display_order) 
SELECT 'Phones & Tablets', 'phones-tablets', id, 1 FROM categories WHERE slug = 'tech';

INSERT INTO categories (name, slug, parent_id, display_order) 
SELECT 'Laptops & Computers', 'laptops-computers', id, 2 FROM categories WHERE slug = 'tech';

INSERT INTO categories (name, slug, parent_id, display_order) 
SELECT 'Audio & Headphones', 'audio-headphones', id, 3 FROM categories WHERE slug = 'tech';

INSERT INTO categories (name, slug, parent_id, display_order) 
SELECT 'Cameras & Photography', 'cameras', id, 4 FROM categories WHERE slug = 'tech';

-- Insert subcategories for Women
INSERT INTO categories (name, slug, parent_id, display_order) 
SELECT 'Clothing', 'women-clothing', id, 1 FROM categories WHERE slug = 'women';

INSERT INTO categories (name, slug, parent_id, display_order) 
SELECT 'Shoes', 'women-shoes', id, 2 FROM categories WHERE slug = 'women';

INSERT INTO categories (name, slug, parent_id, display_order) 
SELECT 'Accessories', 'women-accessories', id, 3 FROM categories WHERE slug = 'women';

-- Insert subcategories for Men
INSERT INTO categories (name, slug, parent_id, display_order) 
SELECT 'Clothing', 'men-clothing', id, 1 FROM categories WHERE slug = 'men';

INSERT INTO categories (name, slug, parent_id, display_order) 
SELECT 'Shoes', 'men-shoes', id, 2 FROM categories WHERE slug = 'men';

INSERT INTO categories (name, slug, parent_id, display_order) 
SELECT 'Accessories', 'men-accessories', id, 3 FROM categories WHERE slug = 'men';

-- Add category_id column to products table
ALTER TABLE products ADD COLUMN category_id INT NULL AFTER category;

-- Migrate existing category data to category_id
UPDATE products p
JOIN categories c ON p.category = c.slug
SET p.category_id = c.id;

-- Add foreign key constraint
ALTER TABLE products 
ADD CONSTRAINT fk_products_category 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_products_category_id ON products(category_id);

-- Note: Keep the old 'category' column for backward compatibility
-- You can drop it later after confirming everything works:
-- ALTER TABLE products DROP COLUMN category;
