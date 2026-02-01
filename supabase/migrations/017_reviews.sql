-- Migration: Create Reviews and Ratings System
-- Description: Add reviews table with ratings and moderation support
-- Converted from MySQL to PostgreSQL

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    comment TEXT,
    helpful_count INTEGER DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, product_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

-- Create review_helpful table (tracks who found reviews helpful)
CREATE TABLE IF NOT EXISTS review_helpful (
    review_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (review_id, user_id),
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add rating columns to products table (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'average_rating'
    ) THEN
        ALTER TABLE products ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'review_count'
    ) THEN
        ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add index
CREATE INDEX IF NOT EXISTS idx_products_average_rating ON products(average_rating);

-- Insert sample reviews for testing (only if test user exists and products exist)
INSERT INTO reviews (product_id, user_id, rating, title, comment, verified_purchase)
SELECT 
    1, 
    u.id,
    5,
    'Excellent quality!',
    'This jacket is exactly as described. Great quality and fits perfectly.',
    TRUE
FROM users u
WHERE u.email = 'test@example.com' 
  AND EXISTS (SELECT 1 FROM products WHERE id = 1)
LIMIT 1
ON CONFLICT (user_id, product_id) DO NOTHING;

INSERT INTO reviews (product_id, user_id, rating, title, comment, verified_purchase)
SELECT 
    2, 
    u.id,
    4,
    'Good phone, minor scratches',
    'Phone works great, battery life is good. Has a few minor scratches but overall happy with the purchase.',
    TRUE
FROM users u
WHERE u.email = 'test@example.com'
  AND EXISTS (SELECT 1 FROM products WHERE id = 2)
LIMIT 1
ON CONFLICT (user_id, product_id) DO NOTHING;
