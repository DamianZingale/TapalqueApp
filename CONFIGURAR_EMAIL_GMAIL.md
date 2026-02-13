# 📧 Configuración de Gmail para Envío de Emails

## ✅ **Por qué Gmail es Mejor para Empezar**

- 🆓 **Totalmente GRATIS**: 500 emails/día
- ⚡ **Configuración rápida**: 5 minutos
- 🔒 **Seguro y confiable**: Usa tu cuenta de Gmail existente
- 📱 **No requiere verificación de dominio**: Funciona con `@gmail.com`

---

## 📋 **Pasos para Configurar Gmail**

### **Paso 1: Habilitar Verificación en 2 Pasos**

1. Ve a tu cuenta de Google: https://myaccount.google.com/security
2. En la sección **"Cómo inicias sesión en Google"**, haz clic en **"Verificación en 2 pasos"**
3. Sigue los pasos para activarla (necesitarás tu teléfono)
4. ✅ Una vez activada, continúa al Paso 2

> ⚠️ **Importante**: La verificación en 2 pasos es OBLIGATORIA para generar contraseñas de aplicación.

---

### **Paso 2: Generar Contraseña de Aplicación**

1. Ve a: https://myaccount.google.com/apppasswords

   *O manualmente:*
   - Cuenta de Google → Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones

2. Te pedirá iniciar sesión de nuevo (por seguridad)

3. En **"Seleccionar app"**, elige: **"Correo"**

4. En **"Seleccionar dispositivo"**, elige: **"Otro (nombre personalizado)"**
   - Escribe: `Tapalque App` o cualquier nombre

5. Click en **"Generar"**

6. Google te mostrará una **contraseña de 16 caracteres**:
   ```
   Ejemplo: abcd efgh ijkl mnop
   ```

7. ⚠️ **IMPORTANTE**: Copia esta contraseña **SIN ESPACIOS**:
   ```
   abcdefghijklmnop
   ```

---

### **Paso 3: Configurar el Archivo .env**

1. Abre el archivo `.env` en la raíz del proyecto:
   ```bash
   nano .env
   ```

2. Busca la sección **Email Configuration** y actualiza:

   ```env
   # Email Configuration - Gmail
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=tu_email@gmail.com
   MAIL_PASSWORD=abcdefghijklmnop
   MAIL_FROM=tu_email@gmail.com
   MAIL_FROM_NAME=Tapalque App
   APP_BASE_URL=http://localhost:3000
   ```

3. Reemplaza:
   - `tu_email@gmail.com` → Tu email de Gmail
   - `abcdefghijklmnop` → La contraseña de aplicación (sin espacios)

4. Guarda el archivo (Ctrl+O, Enter, Ctrl+X en nano)

---

### **Paso 4: Reconstruir el Microservicio**

```bash
./manage.sh
# Selecciona: Reconstruir msvc-user
```

O manualmente:
```bash
cd "portal Backend/msvc-user"
mvn clean package -DskipTests
docker-compose up -d --build msvc-user
```

---

## 🧪 **Probar el Envío de Emails**

### **Opción 1: Registrar un nuevo usuario**

1. Ve a: http://localhost:3000/register
2. Completa el formulario con tu email
3. Haz clic en "Crear cuenta"
4. Verás: "¡Registro exitoso! Se ha enviado un correo..."
5. **Revisa tu bandeja de entrada** (puede tardar 1-2 minutos)

### **Opción 2: Ver logs del backend**

```bash
docker logs msvc-user -f
```

Si el envío falla, verás el error en los logs. Si funciona, verás:
```
Email enviado exitosamente a: usuario@example.com
```

---

## ❌ **Solución de Problemas**

### **Error: "Authentication failed"**

**Causa**: Contraseña incorrecta o verificación en 2 pasos no activada.

**Solución**:
1. Verifica que la verificación en 2 pasos esté activada
2. Genera una NUEVA contraseña de aplicación
3. Copia la contraseña SIN espacios
4. Actualiza el `.env` y reconstruye

---

### **Error: "Less secure app access"**

**Causa**: Estás usando tu contraseña normal de Gmail en lugar de una contraseña de aplicación.

**Solución**:
- NO uses tu contraseña normal de Gmail
- Debes generar y usar una **contraseña de aplicación** (Paso 2)

---

### **El email no llega**

**Posibles causas**:
1. **Revisa la carpeta de Spam**: Gmail a veces marca emails de prueba como spam
2. **Verifica el email**: Asegúrate que `MAIL_USERNAME` y `MAIL_FROM` sean correctos
3. **Revisa los logs**: `docker logs msvc-user`
4. **Puerto bloqueado**: Algunos ISPs bloquean el puerto 587
   - Intenta cambiar a puerto 465 (SSL):
     ```env
     MAIL_PORT=465
     spring.mail.properties.mail.smtp.ssl.enable=true
     ```

---

### **Error: "Could not convert socket to TLS"**

**Solución**: Verifica que el puerto sea 587 y agrega en `application.properties`:
```properties
spring.mail.properties.mail.smtp.starttls.required=true
```

Ya está configurado en tu proyecto, pero verifica que esté presente.

---

## 🔐 **Seguridad**

### ✅ **Buenas prácticas**

1. **Nunca compartas tu contraseña de aplicación**: Es como una contraseña de Gmail
2. **Usa un email dedicado**: Considera crear un email específico para la app
3. **Revoca contraseñas no usadas**:
   - Ve a: https://myaccount.google.com/apppasswords
   - Elimina contraseñas de aplicaciones que ya no uses

### ⚠️ **NO subas el .env a Git**

El archivo `.env` debe estar en `.gitignore`:
```bash
echo ".env" >> .gitignore
```

---

## 📊 **Límites de Gmail**

| Límite | Cuenta Personal | G Suite/Workspace |
|--------|----------------|-------------------|
| Emails/día | 500 | 2,000 |
| Destinatarios/mensaje | 100 | 100 |
| Tamaño del email | 25 MB | 25 MB |

**Para tu caso (TapalqueApp)**:
- 500 emails/día es más que suficiente
- Son emails transaccionales (verificación, notificaciones)
- Tráfico estimado: <50 emails/día

---

## 🆚 **Comparación: Gmail vs Brevo**

| Característica | Gmail (Gratis) | Brevo (Gratis) |
|---------------|---------------|----------------|
| Emails/día | 500 | 300 |
| Configuración | ⭐⭐⭐⭐⭐ Muy fácil | ⭐⭐⭐ Moderada |
| Requisitos | Cuenta Gmail | Registrarse + verificar |
| Dominio propio | ❌ Solo @gmail.com | ✅ Sí (verificación) |
| Analytics | ❌ No | ✅ Sí |
| Templates | ❌ En código | ✅ Editor visual |

**Recomendación**:
- **Gmail**: Perfecto para desarrollo y proyectos pequeños
- **Brevo**: Mejor para producción con dominio propio

---

## 📝 **Ejemplo de .env Completo**

```env
# Email Configuration - Gmail (Free: 500 emails/day)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tapalqueapp@gmail.com
MAIL_PASSWORD=abcdefghijklmnop
MAIL_FROM=tapalqueapp@gmail.com
MAIL_FROM_NAME=Tapalque App
APP_BASE_URL=http://localhost:3000
```

---

## ✅ **Checklist de Configuración**

- [ ] Verificación en 2 pasos activada en Google
- [ ] Contraseña de aplicación generada
- [ ] `.env` actualizado con email y contraseña (sin espacios)
- [ ] `MAIL_FROM` igual a `MAIL_USERNAME`
- [ ] `APP_BASE_URL` apunta a tu frontend
- [ ] msvc-user reconstruido
- [ ] Email de prueba enviado correctamente

---

## 🚀 **Siguiente Paso**

Una vez configurado Gmail, prueba el flujo completo:

1. ✅ Registrar usuario → Email enviado
2. ✅ Click en link del email → Verificación exitosa
3. ✅ Login → Acceso según rol

**¿Listo para probar?** ¡Reconstruye con `./manage.sh` y regístrate!
