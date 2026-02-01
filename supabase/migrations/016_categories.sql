-- Migration: Create Categories Table and Update Products
-- Description: Add categories table with hierarchical support and update products to use category_id
-- Converted from MySQL to PostgreSQL

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id INTEGER NULL,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_categories_updated_at();

-- Insert main categories (only if they don't exist)
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
('Sports & Outdoors', 'sports', 'dumbbell', 10)
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories for Electronics
INSERT INTO categories (name, slug, parent_id, display_order)
SELECT 'Phones & Tablets', 'phones-tablets', id, 1 
FROM categories WHERE slug = 'tech'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, display_order)
SELECT 'Laptops & Computers', 'laptops-computers', id, 2 
FROM categories WHERE slug = 'tech'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, display_order)
SELECT 'Audio & Headphones', 'audio-headphones', id, 3 
FROM categories WHERE slug = 'tech'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, display_order)
SELECT 'Cameras & Photography', 'cameras', id, 4 
FROM categories WHERE slug = 'tech'
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories for Women
INSERT INTO categories (name, slug, parent_id, display_order)
SELECT 'Clothing', 'women-clothing', id, 1 
FROM categories WHERE slug = 'women'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, display_order)
SELECT 'Shoes', 'women-shoes', id, 2 
FROM categories WHERE slug = 'women'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, display_order)
SELECT 'Accessories', 'women-accessories', id, 3 
FROM categories WHERE slug = 'women'
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories for Men
INSERT INTO categories (name, slug, parent_id, display_order)
SELECT 'Clothing', 'men-clothing', id, 1 
FROM categories WHERE slug = 'men'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, display_order)
SELECT 'Shoes', 'men-shoes', id, 2 
FROM categories WHERE slug = 'men'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, display_order)
SELECT 'Accessories', 'men-accessories', id, 3 
FROM categories WHERE slug = 'men'
ON CONFLICT (slug) DO NOTHING;

-- Add category_id column to products table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE products ADD COLUMN category_id INTEGER NULL;
    END IF;
END $$;

-- Migrate existing category data to category_id (if category column exists)
UPDATE products p
SET category_id = c.id
FROM categories c
WHERE p.category = c.slug AND p.category_id IS NULL;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_products_category'
    ) THEN
        ALTER TABLE products 
        ADD CONSTRAINT fk_products_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
