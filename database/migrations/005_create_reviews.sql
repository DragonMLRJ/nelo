-- Migration: Create Reviews and Ratings System
-- Description: Add reviews table with ratings and moderation support

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    comment TEXT,
    helpful_count INT DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_review (user_id, product_id),
    INDEX idx_product (product_id),
    INDEX idx_user (user_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create review_helpful table (tracks who found reviews helpful)
CREATE TABLE IF NOT EXISTS review_helpful (
    review_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (review_id, user_id),
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add rating columns to products table (if they don't exist)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0;

-- Add index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_average_rating ON products(average_rating);

-- Insert some sample reviews for testing (only if test user exists)
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
ON DUPLICATE KEY UPDATE rating=rating;

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
ON DUPLICATE KEY UPDATE rating=rating;

