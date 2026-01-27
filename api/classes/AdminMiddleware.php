<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/JWT.php';

class AdminMiddleware {
    private static $allowedIPs = [
        '127.0.0.1', 
        '::1'
        // Add User's Office IP here in production
    ];

    public static function authenticate() {
        // 1. Verify Token Basic Structure
        $authUserId = JWT::getUserIdFromHeader();
        if (!$authUserId) {
            self::logSecurityEvent(0, 'UNAUTHORIZED_ATTEMPT', 'Missing Token');
            self::abort(401, 'Unauthorized');
        }

        // 2. IP Whitelist Check (Paranoid Mode)
        $ip = $_SERVER['REMOTE_ADDR'];
        // In real world, we might be behind a proxy, check X-Forwarded-For carefully
        // For strict admin, we might enforce VPN-only access which presents as internal IP.
        // For now, we log it. If strictly enforcing:
        // if (!in_array($ip, self::$allowedIPs)) { self::abort(403, 'Untrusted IP'); }

        // 3. Database Verification (The "Double Check")
        // Don't trust the token's "isAdmin" claim blindly. Permissions might have changed.
        $db = getDB();
        $stmt = $db->prepare("SELECT id, is_admin, email FROM users WHERE id = ?");
        $stmt->execute([$authUserId]);
        $user = $stmt->fetch();

        if (!$user || !$user['is_admin']) {
            self::logSecurityEvent($authUserId, 'PRIVILEGE_ESCALATION_ATTEMPT', 'User tried to access Admin area');
            self::abort(403, 'Forbidden: Insufficient Privileges');
        }

        // 4. Log Successful Access
        // Optional: Log every access? Or just mutations? 
        // For "Iron Dome", maybe we hook this into the specific action logger.
        
        return $user['id'];
    }

    public static function logAction($adminId, $action, $target, $details = null) {
        $db = getDB();
        $stmt = $db->prepare("
            INSERT INTO admin_audit_logs 
            (admin_id, action, target_resource, details, ip_address, user_agent) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $adminId,
            $action,
            $target,
            $details,
            $_SERVER['REMOTE_ADDR'],
            $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
        ]);
    }

    private static function logSecurityEvent($userId, $type, $details) {
        // Log into a separate security file or table
        error_log("SECURITY ALERT: User $userId - $type - $details - IP: " . $_SERVER['REMOTE_ADDR']);
    }

    private static function abort($code, $message) {
        http_response_code($code);
        echo json_encode(['error' => $message]);
        exit();
    }
}
?>
