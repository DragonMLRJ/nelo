-- Create disputes table (MySQL Compatible)
CREATE TABLE IF NOT EXISTS disputes (
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    created_by CHAR(36) NOT NULL,
    seller_id CHAR(36) NOT NULL,
    reason ENUM('item_not_received', 'not_as_described', 'other') NOT NULL,
    status ENUM('open', 'seller_replied', 'resolved_refund', 'resolved_no_refund', 'escalated') NOT NULL DEFAULT 'open',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- Create dispute_messages table
CREATE TABLE IF NOT EXISTS dispute_messages (
    id CHAR(36) PRIMARY KEY,
    dispute_id CHAR(36) NOT NULL,
    sender_id CHAR(36) NOT NULL,
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id)
);
