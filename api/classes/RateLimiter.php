<?php
// api/classes/RateLimiter.php

class RateLimiter {
    private $db;
    private $key;
    private $limit;
    private $window; // in seconds

    public function __construct($db, $key, $limit = 60, $window = 60) {
        $this->db = $db;
        $this->key = $key;
        $this->limit = $limit;
        $this->window = $window;
    }

    public function check() {
        try {
            // Cleanup old entries (randomly to avoid load)
            if (rand(1, 100) === 1) {
                $this->db->exec("DELETE FROM rate_limits WHERE reset_at < NOW()");
            }

            $stmt = $this->db->prepare("SELECT * FROM rate_limits WHERE `key` = ?");
            $stmt->execute([$this->key]);
            $record = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($record) {
                if (new DateTime($record['reset_at']) < new DateTime()) {
                    // Window expired, reset
                    $resetAt = (new DateTime())->modify("+{$this->window} seconds")->format('Y-m-d H:i:s');
                    $stmt = $this->db->prepare("UPDATE rate_limits SET attempts = 1, reset_at = ? WHERE `key` = ?");
                    $stmt->execute([$resetAt, $this->key]);
                    return true;
                } else {
                    if ($record['attempts'] >= $this->limit) {
                        return false; // Limit exceeded
                    } else {
                        // Increment
                        $stmt = $this->db->prepare("UPDATE rate_limits SET attempts = attempts + 1 WHERE `key` = ?");
                        $stmt->execute([$this->key]);
                        return true;
                    }
                }
            } else {
                // New record
                $resetAt = (new DateTime())->modify("+{$this->window} seconds")->format('Y-m-d H:i:s');
                $stmt = $this->db->prepare("INSERT INTO rate_limits (`key`, attempts, reset_at) VALUES (?, 1, ?)");
                $stmt->execute([$this->key, $resetAt]);
                return true;
            }
        } catch (PDOException $e) {
            // Fallback: If table doesn't exist, fail OPEN (allow request) to prevent app crash
            // Log error silently
            error_log("RateLimiter Error (Table missing?): " . $e->getMessage());
            return true;
        }
    }
}
?>
