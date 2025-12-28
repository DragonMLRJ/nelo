<?php
// api/classes/Validator.php

class Validator {
    
    public static function sanitize($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitize'], $data);
        }
        return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
    }

    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }

    public static function validateLength($str, $min, $max) {
        $len = strlen($str);
        return $len >= $min && $len <= $max;
    }

    public static function validatePrice($price) {
        return is_numeric($price) && $price >= 0;
    }
}
?>
