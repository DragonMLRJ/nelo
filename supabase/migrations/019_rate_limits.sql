-- Migration: Create Rate Limits Table
-- Description: Add rate limiting support for API endpoints
-- Converted from MySQL to PostgreSQL

CREATE TABLE IF NOT EXISTS rate_limits (
    key VARCHAR(255) PRIMARY KEY,
    attempts INTEGER DEFAULT 1,
    reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);
