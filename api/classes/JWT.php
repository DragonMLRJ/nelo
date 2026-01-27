<?php

class JWT {
    private static $secret_key; // Set via init() or env
    private static $algorithm = 'HS256';

    public static function getSecret() {
        if (!self::$secret_key) {
            self::$secret_key = getenv('JWT_SECRET') ?: 'DEV_SECRET_DO_NOT_USE_IN_PROD_'.date('Ymd');
        }
        return self::$secret_key;
    }

    public static function encode($payload) {
        $key = self::getSecret();
        $header = json_encode(['typ' => 'JWT', 'alg' => self::$algorithm]);
        $payload = json_encode($payload);

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $key, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function decode($jwt) {
        $key = self::getSecret();
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) !== 3) {
            return null; // Invalid token structure
        }

        $header = base64_decode($tokenParts[0]);
        $payload = base64_decode($tokenParts[1]);
        $signature_provided = $tokenParts[2];

        // Verify signature
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $key, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        if ($base64UrlSignature !== $signature_provided) {
            return null; // Invalid signature
        }

        return json_decode($payload, true);
    }

    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    public static function getUserIdFromHeader() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
            $payload = self::decode($token);
            if ($payload && isset($payload['sub'])) {
                // Check expiration if present
                if (isset($payload['exp']) && $payload['exp'] < time()) {
                    return null;
                }
                return $payload['sub'];
            }
        }
        return null;
    }
}
?>
