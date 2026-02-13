package com.tapalque.user.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("PasswordValidator Tests")
class PasswordValidatorTest {

    @Test
    @DisplayName("Debe aceptar contraseña válida con todos los requisitos")
    void validate_ConPasswordValida_NoLanzaExcepcion() {
        // Given
        String passwordValida = "Password1!";

        // When & Then
        assertDoesNotThrow(() -> PasswordValidator.validate(passwordValida));
    }

    @Test
    @DisplayName("Debe rechazar contraseña nula")
    void validate_ConPasswordNula_LanzaExcepcion() {
        // Given
        String password = null;

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> PasswordValidator.validate(password)
        );
        assertTrue(exception.getMessage().contains("8 caracteres"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"Short1!", "Pass1!", "Ab1!"})
    @DisplayName("Debe rechazar contraseñas con menos de 8 caracteres")
    void validate_ConPasswordCorta_LanzaExcepcion(String password) {
        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> PasswordValidator.validate(password)
        );
        assertTrue(exception.getMessage().contains("8 caracteres"));
    }

    @Test
    @DisplayName("Debe rechazar contraseña sin mayúsculas")
    void validate_SinMayusculas_LanzaExcepcion() {
        // Given
        String password = "password1!";

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> PasswordValidator.validate(password)
        );
        assertTrue(exception.getMessage().contains("mayúscula"));
    }

    @Test
    @DisplayName("Debe rechazar contraseña sin minúsculas")
    void validate_SinMinusculas_LanzaExcepcion() {
        // Given
        String password = "PASSWORD1!";

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> PasswordValidator.validate(password)
        );
        assertTrue(exception.getMessage().contains("minúscula"));
    }

    @Test
    @DisplayName("Debe rechazar contraseña sin números")
    void validate_SinNumeros_LanzaExcepcion() {
        // Given
        String password = "Password!!";

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> PasswordValidator.validate(password)
        );
        assertTrue(exception.getMessage().contains("número"));
    }

    @Test
    @DisplayName("Debe rechazar contraseña sin caracteres especiales")
    void validate_SinCaracteresEspeciales_LanzaExcepcion() {
        // Given
        String password = "Password12";

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> PasswordValidator.validate(password)
        );
        assertTrue(exception.getMessage().contains("carácter especial"));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "Password1!",
            "MyP@ssw0rd",
            "Secure#123",
            "Test1234$",
            "Complex!1a"
    })
    @DisplayName("Debe aceptar varias contraseñas válidas")
    void validate_ConVariasPasswordsValidas_NoLanzaExcepcion(String password) {
        assertDoesNotThrow(() -> PasswordValidator.validate(password));
    }
}
