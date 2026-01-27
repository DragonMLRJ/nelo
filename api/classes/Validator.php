<?php

class Validator {
    
    /**
     * Sanitize input string (prevent XSS)
     */
    public static function sanitize($input) {
        if (is_array($input)) {
            return array_map([self::class, 'sanitize'], $input);
        }
        // Remove HTML tags, trim, and convert special chars
        return htmlspecialchars(strip_tags(trim($input ?? '')), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Validate email format (strict)
     */
    public static function validateEmail($email) {
        $email = trim($email);
        if (empty($email)) return false;
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }
    
    /**
     * Validate required fields are present and not empty
     */
    public static function validateRequired($fields, $data) {
        foreach ($fields as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Validate password strength
     * Min 8 chars, at least one number (Simple rules for this context)
     */
    public static function validatePassword($password) {
        if (strlen($password) < 8) return false;
        if (!preg_match('/[0-9]/', $password)) return false; // Must contain number
        return true;
    }

    /**
     * Validate integer ID
     */
    public static function validateInt($value) {
        return filter_var($value, FILTER_VALIDATE_INT) !== false;
    }
}
?>
