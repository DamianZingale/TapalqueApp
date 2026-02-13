package com.tapalque.user.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from}")
    private String fromEmail;

    @Value("${mail.from.name}")
    private String fromName;

    @Value("${app.base.url}")
    private String baseUrl;

    
     // Envía un email HTML
    
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML

            mailSender.send(message);
            log.info("Email enviado exitosamente a: {}", to);
        } catch (MessagingException e) {
            log.error("Error al enviar email a {}: {}", to, e.getMessage());
            throw new RuntimeException("Error al enviar email", e);
        } catch (Exception e) {
            log.error("Error inesperado al enviar email a {}: {}", to, e.getMessage());
            throw new RuntimeException("Error al enviar email", e);
        }
    }


     // Envía email de verificación de cuenta

    public void sendVerificationEmail(String to, String userName, String verificationToken) {
        String verificationUrl = baseUrl + "/verify-email?token=" + verificationToken;

        String subject = "Verifica tu cuenta en Tapalque App";
        String htmlContent = buildVerificationEmailTemplate(userName, verificationUrl);

        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Envía email para restablecer contraseña
     */
    public void sendPasswordResetEmail(String to, String userName, String resetToken) {
        String resetUrl = baseUrl + "/reset-password?token=" + resetToken;

        String subject = "Restablecer contraseña - Tapalque App";
        String htmlContent = buildPasswordResetEmailTemplate(userName, resetUrl);

        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Template HTML para email de restablecimiento de contraseña
     */
    private String buildPasswordResetEmailTemplate(String userName, String resetUrl) {
        return """
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Restablecer contraseña</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                    <tr>
                        <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <!-- Header -->
                                <tr>
                                    <td style="background-color: #6c757d; padding: 30px 20px; text-align: center;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Tapalque App</h1>
                                    </td>
                                </tr>

                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <h2 style="color: #333333; margin-top: 0;">Hola, %s</h2>
                                        <p style="color: #666666; font-size: 16px; line-height: 1.5;">
                                            Recibimos una solicitud para restablecer la contraseña de tu cuenta en Tapalque App.
                                            Si no realizaste esta solicitud, puedes ignorar este correo.
                                        </p>

                                        <table width="100%%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                            <tr>
                                                <td align="center">
                                                    <a href="%s"
                                                       style="display: inline-block; padding: 14px 40px; background-color: #6c757d;
                                                              color: #ffffff; text-decoration: none; border-radius: 5px;
                                                              font-weight: bold; font-size: 16px;">
                                                        Restablecer contraseña
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="color: #999999; font-size: 14px; line-height: 1.5; margin-top: 30px;">
                                            Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:
                                        </p>
                                        <p style="color: #6c757d; font-size: 13px; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
                                            %s
                                        </p>

                                        <p style="color: #dc3545; font-size: 13px; margin-top: 30px;">
                                            <strong>Importante:</strong> Este enlace expirará en 1 hora por razones de seguridad.
                                        </p>

                                        <p style="color: #999999; font-size: 13px; margin-top: 20px;">
                                            Si no solicitaste restablecer tu contraseña, puedes ignorar este email.
                                            Tu cuenta permanecerá segura.
                                        </p>
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                                        <p style="color: #999999; font-size: 12px; margin: 0;">
                                            © 2026 Tapalque App. Todos los derechos reservados.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(userName, resetUrl, resetUrl);
    }

    
     // Template HTML para email de verificación
     
    private String buildVerificationEmailTemplate(String userName, String verificationUrl) {
        return """
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verifica tu cuenta</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                    <tr>
                        <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <!-- Header -->
                                <tr>
                                    <td style="background-color: #6c757d; padding: 30px 20px; text-align: center;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Tapalque App</h1>
                                    </td>
                                </tr>

                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <h2 style="color: #333333; margin-top: 0;">¡Bienvenido, %s!</h2>
                                        <p style="color: #666666; font-size: 16px; line-height: 1.5;">
                                            Gracias por registrarte en Tapalque App. Para completar tu registro y activar tu cuenta,
                                            por favor verifica tu dirección de correo electrónico haciendo clic en el botón de abajo.
                                        </p>

                                        <table width="100%%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                            <tr>
                                                <td align="center">
                                                    <a href="%s"
                                                       style="display: inline-block; padding: 14px 40px; background-color: #6c757d;
                                                              color: #ffffff; text-decoration: none; border-radius: 5px;
                                                              font-weight: bold; font-size: 16px;">
                                                        Verificar mi cuenta
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="color: #999999; font-size: 14px; line-height: 1.5; margin-top: 30px;">
                                            Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:
                                        </p>
                                        <p style="color: #6c757d; font-size: 13px; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
                                            %s
                                        </p>

                                        <p style="color: #999999; font-size: 13px; margin-top: 30px;">
                                            <strong>Nota:</strong> Este enlace expirará en 24 horas.
                                        </p>

                                        <p style="color: #999999; font-size: 13px; margin-top: 20px;">
                                            Si no creaste esta cuenta, puedes ignorar este email.
                                        </p>
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                                        <p style="color: #999999; font-size: 12px; margin: 0;">
                                            © 2026 Tapalque App. Todos los derechos reservados.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(userName, verificationUrl, verificationUrl);
    }
}
