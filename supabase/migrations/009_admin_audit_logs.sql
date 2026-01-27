-- ==============================================================================
-- MIGRATION: 009_admin_audit_logs.sql
-- PURPOSE: Immutable audit trail for all admin actions.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    target_resource VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for searching logs
CREATE INDEX idx_admin_logs ON admin_audit_logs (admin_id, action, created_at);

-- Add 'last_login_ip' to users for security tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
