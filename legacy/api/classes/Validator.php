<?php

class Validator {
    
    /**
     * Sanitize input string
     */
    public static function sanitize($input) {
        if (is_array($input)) {
            return array_map([self::class, 'sanitize'], $input);
        }
        return htmlspecialchars(strip_tags(trim($input ?? '')));
    }
    
    /**
     * Validate email format
     */
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }
    
    /**
     * Validate required fields
     */
    public static function validateRequired($fields, $data) {
        foreach ($fields as $field) {
            if (empty($data[$field])) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Validate password strength (min 6 chars)
     */
    public static function validatePassword($password) {
        return strlen($password) >= 6;
    }
}
?>
