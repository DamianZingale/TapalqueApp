package com.tapalque.user.util;

import java.util.regex.Pattern;

public class PasswordValidator {
    
    private static final int MIN_LENGTH = 8;
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[!@#$%^&*(),.?\":{}|<>]");
    
    public static void validate(String password) {
        if (password == null || password.length() < MIN_LENGTH) {
            throw new IllegalArgumentException("La contraseña debe tener al menos " + MIN_LENGTH + " caracteres");
        }
        
        if (!UPPERCASE_PATTERN.matcher(password).find()) {
            throw new IllegalArgumentException("La contraseña debe contener al menos una mayúscula");
        }
        
        if (!LOWERCASE_PATTERN.matcher(password).find()) {
            throw new IllegalArgumentException("La contraseña debe contener al menos una minúscula");
        }
        
        if (!DIGIT_PATTERN.matcher(password).find()) {
            throw new IllegalArgumentException("La contraseña debe contener al menos un número");
        }
        
        if (!SPECIAL_CHAR_PATTERN.matcher(password).find()) {
            throw new IllegalArgumentException("La contraseña debe contener al menos un carácter especial");
        }
    }
}