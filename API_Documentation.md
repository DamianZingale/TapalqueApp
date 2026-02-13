# Documentación de API - TapalqueApp Backend

## Índice
1. [MSVC-USER](#1-msvc-user-gestión-de-usuarios)
2. [MSVC-JWT](#2-msvc-jwt-autenticación)
3. [MSVC-GASTRONOMIA](#3-msvc-gastronomia-restaurantes)
4. [MSVC-HOSTELERIA](#4-msvc-hosteleria-hospedajes)
5. [MSVC-TERMAS](#5-msvc-termas)
6. [MSVC-SERVICIOS](#6-msvc-servicios)
7. [MSVC-EVENTOS](#7-msvc-eventos)
8. [MSVC-COMERCIO](#8-msvc-comercio)
9. [MSVC-ESPACIOS-PUBLICOS](#9-msvc-espacios-publicos)
10. [MSVC-RESERVAS](#10-msvc-reservas-reactivo)
11. [MSVC-PEDIDOS](#11-msvc-pedidos-reactivo)
12. [MSVC-MERCADO-PAGO](#12-msvc-mercado-pago)

---

## 1. MSVC-USER (Gestión de Usuarios)

### User Controller - Base Path: `/user`

| Método | Path | Descripción |
|--------|------|-------------|
| POST | `/user/public/register` | Registro público de usuario |
| POST | `/user/AdminRegistro` | Registro de administrador |
| POST | `/user/GastroRegistro` | Registro de usuario gastronómico |
| GET | `/user/email/{email}` | Obtener usuario por email |
| GET | `/user/public/verify-email?token={token}` | Verificar email |
| POST | `/user/public/resend-verification` | Reenviar verificación |
| GET | `/user/all` | Listar todos los usuarios |
| GET | `/user/{id}` | Obtener usuario por ID |
| GET | `/user/administradores` | Listar administradores |
| PATCH | `/user/{id}/role` | Cambiar rol de usuario |
| POST | `/user/moderador/create` | Crear moderador |
| PUT | `/user/{id}/profile` | Actualizar perfil |
| PUT | `/user/{id}/password` | Cambiar contraseña |
| GET | '/user/

#### DTOs de Usuario

**UserRegistrationDTO (Request)**
```json
{
  "email": "string",
  "nombre": "string",
  "contrasenia": "string",
  "role": "string (opcional)"
}
```

**UserResponseDTO (Response)**
```json
{
  "id": "Long",
  "email": "string",
  "nombre": "string",
  "apellido": "string",
  "direccion": "string",
  "rol": "string",
  "emailVerified": "boolean"
}
```

**UpdateProfileDTO (Request)**
```json
{
  "nombre": "string",
  "apellido": "string",
  "direccion": "string"
}
```

**ChangePasswordDTO (Request)**
```json
{
  "passwordActual": "string",
  "passwordNueva": "string"
}
```

### Business Controller - Base Path: `/business`

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/business/user/{userId}` | Negocios por usuario |
| GET | `/business/{businessId}` | Negocio por ID |
| GET | `/business/external/{externalBusinessId}/type/{businessType}` | Negocio por ID externo |
| GET | `/business/all` | Listar todos los negocios |
| POST | `/business` | Crear negocio |
| PATCH | `/business/{businessId}/owner` | Cambiar propietario |
| DELETE | `/business/{businessId}` | Eliminar negocio |

#### DTOs de Business

**BusinessDTO (Response)**
```json
{
  "id": "Long",
  "name": "string",
  "businessType": "enum (GASTRONOMIA, HOSPEDAJE, TERMA, SERVICIO, COMERCIO, EVENTO)",
  "externalBusinessId": "Long"
}
```

**BusinessRequestDTO (Request)**
```json
{
  "ownerId": "Long",
  "name": "string",
  "businessType": "enum",
  "externalBusinessId": "Long"
}
```

---

## 2. MSVC-JWT (Autenticación)

### Base Path: `/jwt/public`

| Método | Path | Descripción |
|--------|------|-------------|
| POST | `/jwt/public/login` | Iniciar sesión |
| POST | `/jwt/public/refresh-token` | Refrescar token |
| POST | `/jwt/public/validate` | Validar token |

#### DTOs de Autenticación

**AuthRequestDTO (Request)**
```json
{
  "email": "string",
  "password": "string"
}
```

**TokenResponse (Response)**
```json
{
  "token": "string",
  "refreshToken": "string"
}
```

**Validate Response**
```json
{
  "email": "string",
  "rol": "string"
}
```

---

## 3. MSVC-GASTRONOMIA (Restaurantes)

### Restaurant Controller - Base Path: `/restaurante`

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/restaurante/findAll` | Listar restaurantes |
| GET | `/restaurante/findById/{id}` | Obtener restaurante |
| POST | `/restaurante/save` | Crear restaurante |
| PUT | `/restaurante/update/{id}` | Actualizar restaurante |
| DELETE | `/restaurante/delete/{id}` | Eliminar restaurante |
| POST | `/restaurante/{restaurantId}/imagenes` | Subir imagen (Multipart) |
| GET | `/restaurante/{restaurantId}/imagenes` | Listar imágenes |
| DELETE | `/restaurante/{restaurantId}/imagenes` | Eliminar imagen |

#### DTOs de Restaurante

**RestaurantDTO**
```json
{
  "id": "Long",
  "name": "string",
  "address": "string",
  "email": "string",
  "latitude": "Double",
  "longitude": "Double",
  "categories": "string",
  "phones": "string",
  "schedule": "string",
  "delivery": "boolean"
}
```

### Menu Controller - Base Path: `/gastronomia/menu`

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/gastronomia/menu/getMenu/{id}` | Obtener menú por ID restaurante |

#### DTOs de Menú

**MenuDTO**
```json
{
  "id": "Long",
  "description": "string",
  "restaurantId": "Long",
  "dishes": [
    {
      "id": "Long",
      "name": "string",
      "description": "string",
      "price": "Double"
    }
  ]
}
```

### Image Controller - Base Path: `/api/gastronomia/images`

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/api/gastronomia/images/{filename}` | Servir imagen |

---

## 4. MSVC-HOSTELERIA (Hospedajes)

### Base Path: `/api/hospedajes`

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/api/hospedajes` | Listar hospedajes |
| GET | `/api/hospedajes/{id}` | Obtener hospedaje |
| POST | `/api/hospedajes` | Crear hospedaje |
| PUT | `/api/hospedajes/{id}` | Actualizar hospedaje |
| DELETE | `/api/hospedajes/{id}` | Eliminar hospedaje |
| POST | `/api/hospedajes/{hospedajeId}/imagenes` | Subir imagen (Multipart) |
| GET | `/api/hospedajes/{hospedajeId}/imagenes` | Listar imágenes |
| DELETE | `/api/hospedajes/{hospedajeId}/imagenes` | Eliminar imagen |

#### DTOs de Hospedaje

**HospedajeDTO / HospedajeRequestDTO**
```json
{
  "id": "Long",
  "titulo": "string",
  "description": "string",
  "ubicacion": "string",
  "googleMapsUrl": "string",
  "numWhatsapp": "string",
  "tipoHospedaje": "enum (HOTEL, CABANA, CAMPING, DEPARTAMENTO, HOSTEL)",
  "imagenes": ["string"]
}
```

---

## 5. MSVC-TERMAS

### Base Path: `/api/terma`

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/api/terma` | Listar termas |
| GET | `/api/terma/{id}` | Obtener terma |
| POST | `/api/terma` | Crear terma |
| PUT | `/api/terma/{id}` | Actualizar terma (completo) |
| PATCH | `/api/terma/{id}` | Actualizar terma (parcial) |
| DELETE | `/api/terma/{id}` | Eliminar terma |
| GET | `/api/terma/test` | Test de conexión |
| POST | `/api/terma/{termaId}/imagenes` | Subir imagen (Multipart) |
| GET | `/api/terma/{termaId}/imagenes` | Listar imágenes |
| DELETE | `/api/terma/{termaId}/imagenes` | Eliminar imagen |

#### DTOs de Terma

**TermaRequestDTO (Request)**
```json
{
  "titulo": "string",
  "descripcion": "string",
  "direccion": "string",
  "horario": "string",
  "telefono": "string",
  "latitud": "Double",
  "longitud": "Double",
  "facebook": "string",
  "instagram": "string"
}
```

**TermaResponseDTO (Response)**
```json
{
  "id": "Long",
  "titulo": "string",
  "descripcion": "string",
  "direccion": "string",
  "horario": "string",
  "telefono": "string",
  "latitud": "Double",
  "longitud": "Double",
  "facebook": "string",
  "instagram": "string",
  "imagenes": [
    {
      "imagenUrl": "string"
    }
  ]
}
```

---

## 6. MSVC-SERVICIOS

### Base Path: `/api/servicio`

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/api/servicio` | Listar servicios |
| GET | `/api/servicio/{id}` | Obtener servicio |
| POST | `/api/servicio` | Crear servicio |
| PUT | `/api/servicio/{id}` | Actualizar servicio (completo) |
| PATCH | `/api/servicio/{id}` | Actualizar servicio (parcial) |
| DELETE | `/api/servicio/{id}` | Eliminar servicio |
| GET | `/api/servicio/test` | Test de conexión |
| POST | `/api/servicio/{servicioId}/imagenes` | Subir imagen (Multipart) |
| GET | `/api/servicio/{servicioId}/imagenes` | Listar imágenes |
| DELETE | `/api/servicio/{servicioId}/imagenes` | Eliminar imagen |

#### DTOs de Servicio

**ServicioRequestDTO (Request)**
```json
{
  "titulo": "string",
  "descripcion": "string",
  "direccion": "string",
  "horario": "string",
  "telefono": "string",
  "latitud": "Double",
  "longitud": "Double",
  "facebook": "string",
  "instagram": "string"
}
```

**ServicioResponseDTO (Response)**
```json
{
  "id": "Long",
  "titulo": "string",
  "descripcion": "string",
  "direccion": "string",
  "horario": "string",
  "telefono": "string",
  "latitud": "Double",
  "longitud": "Double",
  "facebook": "string",
  "instagram": "string",
  "imagenes": [
    {
      "imagenUrl": "string"
    }
  ]
}
```

---

## 7. MSVC-EVENTOS

### Base Path: `/api/evento`

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/api/evento` | Listar eventos |
| GET | `/api/evento/{id}` | Obtener evento |
| POST | `/api/evento` | Crear evento |
| PUT | `/api/evento/{id}` | Actualizar evento (completo) |
| PATCH | `/api/evento/{id}` | Actualizar evento (parcial) |
| DELETE | `/api/evento/{id}` | Eliminar evento |
| GET | `/api/evento/test` | Test de conexión |
| POST | `/api/evento/{eventoId}/imagenes` | Subir imagen (Multipart) |
| GET | `/api/evento/{eventoId}/imagenes` | Listar imágenes |
| DELETE | `/api/evento/{eventoId}/imagenes` | Eliminar imagen |

#### DTOs de Evento

**EventoRequestDTO (Request)**
```json
{
  "nombreEvento": "string",
  "lugar": "string",
  "horario": "string",
  "fechaInicio": "LocalDate (YYYY-MM-DD)",
  "fechaFin": "LocalDate (YYYY-MM-DD, opcional)",
  "telefonoContacto": "string",
  "nombreContacto": "string"
}
```

**EventoResponseDTO (Response)**
```json
{
  "id": "Long",
  "nombreEvento": "string",
  "lugar": "string",
  "horario": "string",
  "fechaInicio": "LocalDate",
  "fechaFin": "LocalDate",
  "telefonoContacto": "string",
  "nombreContacto": "string",
  "imagenes": [
    {
      "imagenUrl": "string"
    }
  ]
}
```

---

## 8. MSVC-COMERCIO

### Comercio Controller - Base Path: `/comercio`

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/comercio/list` | Listar comercios |
| GET | `/comercio/{id}` | Obtener comercio |
| POST | `/comercio` | Crear comercio |
| PUT | `/comercio/{id}` | Actualizar comercio (completo) |
| PATCH | `/comercio/patch/{id}` | Actualizar comercio (parcial) |
| DELETE | `/comercio/{id}` | Eliminar comercio |

### Image Controller - Base Path: `/api/comercio`

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/api/comercio/test` | Test de conexión |
| POST | `/api/comercio/{comercioId}/imagenes` | Subir imagen (Multipart) |
| GET | `/api/comercio/{comercioId}/imagenes` | Listar imágenes |
| DELETE | `/api/comercio/{comercioId}/imagenes` | Eliminar imagen |

#### DTOs de Comercio

**ComercioRequestDTO (Request)**
```json
{
  "titulo": "string",
  "descripcion": "string",
  "direccion": "string",
  "horario": "string",
  "telefono": "string",
  "latitud": "Double",
  "longitud": "Double",
  "facebook": "string",
  "instagram": "string"
}
```

**ComercioResponseDTO (Response)**
```json
{
  "id": "Long",
  "titulo": "string",
  "descripcion": "string",
  "direccion": "string",
  "horario": "string",
  "telefono": "string",
  "latitud": "Double",
  "longitud": "Double",
  "facebook": "string",
  "instagram": "string",
  "imagenes": [
    {
      "imagenUrl": "string"
    }
  ]
}
```

---

## 9. MSVC-ESPACIOS-PUBLICOS

### Base Path: `/api/espacio-publico`

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/api/espacio-publico` | Listar espacios (Query: categoria?) |
| GET | `/api/espacio-publico/{id}` | Obtener espacio |
| POST | `/api/espacio-publico` | Crear espacio |
| PUT | `/api/espacio-publico/{id}` | Actualizar espacio (completo) |
| PATCH | `/api/espacio-publico/{id}` | Actualizar espacio (parcial) |
| DELETE | `/api/espacio-publico/{id}` | Eliminar espacio |

### Image Controller - Base Path: `/api/espacio-publico/imagen`

| Método | Path | Descripción |
|--------|------|-------------|
| POST | `/api/espacio-publico/imagen/{espacioPublicoId}` | Subir imagen (Multipart) |
| DELETE | `/api/espacio-publico/imagen/{imagenId}` | Eliminar imagen |

#### DTOs de Espacio Público

**EspacioPublicoRequestDTO (Request)**
```json
{
  "nombre": "string",
  "descripcion": "string",
  "direccion": "string",
  "categoria": "enum",
  "latitud": "Double",
  "longitud": "Double"
}
```

**EspacioPublicoResponseDTO (Response)**
```json
{
  "id": "Long",
  "nombre": "string",
  "descripcion": "string",
  "direccion": "string",
  "categoria": "enum",
  "latitud": "Double",
  "longitud": "Double",
  "imagenes": [
    {
      "imagenUrl": "string"
    }
  ]
}
```

---

## 10. MSVC-RESERVAS (Reactivo)

### Base Path: `/reservations`

| Método | Path | Descripción |
|--------|------|-------------|
| POST | `/reservations/mew` | Crear reserva |
| GET | `/reservations/by-id/{id}` | Obtener reserva por ID |
| PUT | `/reservations/update/{id}` | Actualizar reserva |
| DELETE | `/reservations/delete/{id}` | Eliminar reserva |
| GET | `/reservations/by-hotel/{hotelId}` | Reservas por hotel (Query: desde?, hasta?) |
| GET | `/reservations/by-customer/{customerId}` | Reservas por cliente (Query: desde?, hasta?) |

#### DTOs de Reserva

**ReservationDTO**
```json
{
  "id": "string",
  "customer": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string"
  },
  "hotel": {
    "id": "string",
    "name": "string"
  },
  "stayPeriod": {
    "checkIn": "LocalDate",
    "checkOut": "LocalDate"
  },
  "payment": {
    "amount": "Double",
    "status": "string",
    "method": "string"
  }
}
```

---

## 11. MSVC-PEDIDOS (Reactivo)

### Base Path: `/orders`

| Método | Path | Descripción |
|--------|------|-------------|
| POST | `/orders/new` | Crear pedido |
| GET | `/orders/{id}` | Obtener pedido por ID |
| GET | `/orders/restaurant/{restaurantId}` | Pedidos por restaurante (Query: desde?, hasta?) |
| GET | `/orders/user/{userId}` | Pedidos por usuario (Query: desde?, hasta?) |
| PUT | `/orders/{id}` | Actualizar pedido |
| DELETE | `/orders/{id}` | Eliminar pedido |

#### DTOs de Pedido

**OrderDTO**
```json
{
  "id": "string",
  "totalPrice": "Double",
  "paidWithMercadoPago": "Boolean",
  "paidWithCash": "Boolean",
  "status": "string",
  "dateCreated": "LocalDateTime",
  "dateUpdated": "LocalDateTime",
  "items": [
    {
      "id": "string",
      "name": "string",
      "quantity": "Integer",
      "price": "Double"
    }
  ],
  "restaurant": {
    "id": "Long",
    "name": "string"
  },
  "paymentReceiptPath": "string"
}
```

---

## 12. MSVC-MERCADO-PAGO

### Base Path: `/api`

| Método | Path | Descripción |
|--------|------|-------------|
| POST | `/api/pagos/crear` | Crear preferencia de pago |
| POST | `/api/webhook` | Webhook de Mercado Pago |

#### DTOs de Pago

**ProductoRequestDTO (Request)**
```json
{
  "title": "string",
  "quantity": "Integer",
  "unitPrice": "Double"
}
```

**Response de crear pago**
```json
"string (URL de initPoint de Mercado Pago)"
```

---

## DTO Común para Imágenes

**ImagenResponseDTO (Response)**
```json
{
  "imagenUrl": "string"
}
```

**ImagenRequestDTO (Request para DELETE)**
```json
{
  "imagenUrl": "string"
}
```

---

## Resumen de Endpoints

| Microservicio | Cantidad | Base Path |
|---------------|----------|-----------|
| msvc-user | 20 | `/user`, `/business` |
| msvc-jwt | 3 | `/jwt/public` |
| msvc-gastronomia | 10 | `/restaurante`, `/gastronomia/menu` |
| msvc-hosteleria | 8 | `/api/hospedajes` |
| msvc-termas | 10 | `/api/terma` |
| msvc-servicios | 10 | `/api/servicio` |
| msvc-eventos | 10 | `/api/evento` |
| msvc-comercio | 10 | `/comercio`, `/api/comercio` |
| msvc-espacios-publicos | 8 | `/api/espacio-publico` |
| msvc-reservas | 6 | `/reservations` |
| msvc-pedidos | 6 | `/orders` |
| msvc-mercado-pago | 2 | `/api` |

**Total: ~103 endpoints**

---

## Notas Adicionales

### Autenticación
- La mayoría de endpoints requieren token JWT en el header: `Authorization: Bearer {token}`
- Endpoints públicos están marcados con `/public/` en el path

### Tipos de Datos
- `Long`: Número entero de 64 bits
- `Double`: Número decimal de 64 bits
- `Boolean`: true/false
- `string`: Cadena de texto
- `LocalDate`: Fecha en formato YYYY-MM-DD
- `LocalDateTime`: Fecha y hora en formato ISO 8601

### Manejo de Imágenes
- Las imágenes se suben como `multipart/form-data`
- El campo del archivo debe llamarse `file`
- Formatos soportados: JPEG, PNG, GIF, WebP

### Microservicios Reactivos
- msvc-reservas y msvc-pedidos usan programación reactiva
- Retornan `Mono<T>` para respuestas únicas
- Retornan `Flux<T>` para listas/streams

---

*Documentación generada automáticamente - TapalqueApp Backend*
