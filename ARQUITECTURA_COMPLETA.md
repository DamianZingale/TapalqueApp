# Arquitectura Completa - Sistema Tapalqué

## 1. SISTEMA DE HOSTELERÍA

### 1.1 Modelo de Datos

#### Hospedaje (Entidad Principal)
```java
- id: Long
- titulo: String
- descripcion: String
- ubicacion: String
- googleMapsUrl: String
- numWhatsapp: String
- tipoHospedaje: TipoHospedaje (HOTEL, HOSPEDAJE_INDIVIDUAL, CABAÑA, etc.)
- esHotel: boolean (determina si tiene habitaciones múltiples)
- capacidadMaxima: Integer (si NO es hotel)
- precioPorNoche: BigDecimal (si NO es hotel)
- administradorId: Long (FK a msvc-user)
- requiereEstanciaMinima: boolean
- estanciaMinimaFinDeSemana: Integer (default: 2)
- imagenes: List<HospedajeImagen>
- servicios: List<Servicio>
- habitaciones: List<Habitacion> (solo si esHotel = true)
```

#### Habitacion (Para hoteles)
```java
- id: Long
- hospedajeId: Long (FK)
- numero: String
- tipo: TipoHabitacion (SIMPLE, DOBLE, TRIPLE, CUADRUPLE, SUITE)
- capacidad: Integer
- precioPorNoche: BigDecimal
- descripcion: String
- tieneMovilidadReducida: boolean
- imagenes: List<HabitacionImagen>
- servicios: List<ServicioHabitacion>
```

#### Servicio
```java
- id: Long
- nombre: String (PILETA, AIRE_ACONDICIONADO, WIFI, ESTACIONAMIENTO, etc.)
- icono: String
```

#### PlanComida
```java
- id: Long
- hospedajeId: Long (FK)
- tipo: TipoPlan (SOLO_ALOJAMIENTO, DESAYUNO, MEDIA_PENSION, PENSION_COMPLETA)
- precioAdicional: BigDecimal
- descripcion: String
```

### 1.2 Sistema de Reservas

#### Reserva
```java
- id: Long
- hospedajeId: Long (FK)
- habitacionId: Long (FK, nullable)
- userId: Long (FK a msvc-user)
- fechaInicio: LocalDate
- fechaFin: LocalDate
- cantidadNoches: Integer
- cantidadPersonas: Integer
- planComidaId: Long (FK, nullable)
- precioTotal: BigDecimal
- estadoReserva: EstadoReserva (PENDIENTE_PAGO, BLOQUEADA_TEMPORAL, CONFIRMADA, CANCELADA)
- fechaBloqueo: LocalDateTime (para liberar después de 5 min)
- pagoId: Long (FK a msvc-mercado-pago)
- esReservaExterna: boolean (hecha por admin sin app)
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
```

#### DisponibilidadHospedaje (Cache de disponibilidad)
```java
- id: Long
- hospedajeId: Long (FK)
- habitacionId: Long (FK, nullable)
- fecha: LocalDate
- disponible: boolean
- reservadaPor: Long (userId, nullable)
```

### 1.3 Reglas de Negocio

1. **Estancia Mínima Fin de Semana:**
   - Jueves a Domingo: mínimo 2 noches (configurable por hospedaje)
   - Miércoles previo: permite 1 noche si hay disponibilidad
   - Resto de semana: sin restricción

2. **Bloqueo Temporal:**
   - Al iniciar reserva: bloquear 5 minutos
   - Cronjob cada minuto: liberar reservas expiradas sin pago

3. **Disponibilidad:**
   - Actualización en tiempo real
   - Cache de disponibilidad por fecha
   - Validación de solapamiento de fechas

---

## 2. SISTEMA DE GASTRONOMÍA

### 2.1 Modelo de Datos Existente (Mejorar)

#### Restaurant
```java
- id: Long
- nombre: String
- descripcion: String
- direccion: String
- telefono: String
- administradorId: Long (FK a msvc-user)
- horarioApertura: String
- horarioCierre: String
- diasAbierto: List<DiaSemana>
- imagenes: List<RestaurantImagen>
- acepta_delivery: boolean
- acepta_retiro: boolean
```

#### MenuItem (Plato)
```java
- id: Long
- restaurantId: Long (FK)
- nombre: String
- descripcion: String
- precio: BigDecimal
- categoria: Categoria (ENTRADA, PRINCIPAL, POSTRE, BEBIDA, etc.)
- disponible: boolean
- imagenes: List<MenuItemImagen>
- ingredientes: List<Ingrediente>
- restricciones: List<Restriccion> (VEGETARIANO, VEGANO, SIN_GLUTEN, etc.)
- tiempoPreparacion: Integer (minutos)
```

#### Ingrediente
```java
- id: Long
- nombre: String
- esAlergeno: boolean
- icono: String
```

#### Pedido
```java
- id: Long
- restaurantId: Long (FK)
- userId: Long (FK a msvc-user)
- items: List<PedidoItem>
- total: BigDecimal
- tipoPedido: TipoPedido (DELIVERY, RETIRO)
- estadoPedido: EstadoPedido (PENDIENTE, EN_PREPARACION, LISTO, ENTREGADO, CANCELADO)
- direccionEntrega: String (si es delivery)
- fechaHora: LocalDateTime
- pagoId: Long (FK a msvc-mercado-pago)
- notasEspeciales: String
```

#### PedidoItem
```java
- id: Long
- pedidoId: Long (FK)
- menuItemId: Long (FK)
- cantidad: Integer
- precioUnitario: BigDecimal
- notasEspeciales: String
```

### 2.2 Sistema de Estados en Tiempo Real

1. **Estados del Pedido:**
   - PENDIENTE → pago exitoso, pedido recibido
   - EN_PREPARACION → admin marca como en preparación
   - LISTO → admin marca como listo para retiro/delivery
   - ENTREGADO → completado
   - CANCELADO → cancelado por cualquier razón

2. **Notificaciones:**
   - WebSocket para actualizaciones en tiempo real
   - Email/SMS al cambiar estado
   - Panel de administrador con cola de pedidos

---

## 3. SISTEMA DE USUARIOS

### 3.1 Perfil Obligatorio

#### User (Expandir existente)
```java
- id: Long
- email: String (NO modificable)
- password: String (NO modificable desde perfil)
- firstName: String (OBLIGATORIO antes de transacción)
- lastName: String (OBLIGATORIO antes de transacción)
- dni: String (OBLIGATORIO antes de transacción)
- telefono: String (OBLIGATORIO antes de transacción)
- direccion: String (OBLIGATORIO antes de transacción)
- ciudad: String (OBLIGATORIO antes de transacción)
- provincia: String (OBLIGATORIO antes de transacción)
- codigoPostal: String (OBLIGATORIO antes de transacción)
- fotoPerfil: String (OPCIONAL)
- perfilCompleto: boolean (calculado automáticamente)
- roles: List<Role>
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
- emailVerified: boolean
```

### 3.2 Validación de Perfil

**Middleware/Interceptor para transacciones:**
- Verificar perfilCompleto = true antes de:
  - Crear pedido
  - Crear reserva
  - Cualquier pago

---

## 4. SISTEMA DE MERCADO PAGO

### 4.1 Modelo de Datos

#### TransaccionMercadoPago
```java
- id: Long
- userId: Long (FK)
- tipo: TipoTransaccion (PEDIDO, RESERVA)
- referenciaId: Long (ID del pedido o reserva)
- monto: BigDecimal
- porcentajePagado: Integer (50 para reservas, 100 para pedidos)
- estadoTransaccion: EstadoTransaccion (INICIADA, PENDIENTE, APROBADA, RECHAZADA, CANCELADA)
- mercadoPagoId: String (ID de MP)
- preferenciaId: String (preference ID de MP)
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
- expiraEn: LocalDateTime (para reservas: 5 minutos)
```

### 4.2 Limpieza Automática

**Cronjob (Domingos 4am):**
```sql
DELETE FROM transaccion_mercado_pago
WHERE estado_transaccion IN ('INICIADA', 'PENDIENTE', 'RECHAZADA', 'CANCELADA')
AND created_at < NOW() - INTERVAL 7 DAYS;
```

---

## 5. ENDPOINTS API

### 5.1 Hostelería

#### Público
- GET `/api/hosteleria` - Listar hospedajes
- GET `/api/hosteleria/{id}` - Detalle hospedaje
- GET `/api/hosteleria/{id}/habitaciones` - Listar habitaciones (si es hotel)
- GET `/api/hosteleria/{id}/disponibilidad?fechaInicio&fechaFin` - Verificar disponibilidad
- POST `/api/reservas` - Crear reserva (requiere perfil completo)
- GET `/api/reservas/{id}` - Detalle reserva

#### Administrador
- PUT `/api/hosteleria/{id}` - Actualizar hospedaje
- POST `/api/hosteleria/{id}/habitaciones` - Agregar habitación
- PUT `/api/hosteleria/{id}/habitaciones/{habitacionId}` - Actualizar habitación
- DELETE `/api/hosteleria/{id}/habitaciones/{habitacionId}` - Eliminar habitación
- POST `/api/hosteleria/{id}/servicios` - Agregar servicio
- POST `/api/reservas/externa` - Crear reserva externa
- GET `/api/reservas/mis-reservas` - Ver reservas del hospedaje

### 5.2 Gastronomía

#### Público
- GET `/api/gastronomia` - Listar restaurantes
- GET `/api/gastronomia/{id}` - Detalle restaurant
- GET `/api/gastronomia/{id}/menu` - Ver menú
- POST `/api/pedidos` - Crear pedido (requiere perfil completo)
- GET `/api/pedidos/{id}` - Detalle pedido

#### Administrador
- PUT `/api/gastronomia/{id}` - Actualizar restaurant
- POST `/api/gastronomia/{id}/menu` - Agregar plato
- PUT `/api/gastronomia/{id}/menu/{platoId}` - Actualizar plato
- DELETE `/api/gastronomia/{id}/menu/{platoId}` - Eliminar plato
- PATCH `/api/gastronomia/{id}/menu/{platoId}/precio` - Cambiar precio
- POST `/api/gastronomia/{id}/ingredientes` - Agregar ingrediente
- GET `/api/pedidos/mis-pedidos` - Ver pedidos del restaurant
- PATCH `/api/pedidos/{id}/estado` - Cambiar estado pedido

### 5.3 Usuario

- GET `/api/user/perfil` - Ver perfil
- PUT `/api/user/perfil` - Actualizar perfil (excepto email/password)
- GET `/api/user/perfil/completo` - Verificar si perfil está completo
- POST `/api/user/perfil/foto` - Subir foto perfil
- GET `/api/user/mis-pedidos` - Historial pedidos
- GET `/api/user/mis-reservas` - Historial reservas

---

## 6. JOBS PROGRAMADOS

### 6.1 Limpieza Transacciones MP
- **Frecuencia:** Domingos 4:00 AM
- **Acción:** Eliminar transacciones no completadas > 7 días

### 6.2 Liberación Reservas Bloqueadas
- **Frecuencia:** Cada 1 minuto
- **Acción:** Liberar reservas con estado BLOQUEADA_TEMPORAL > 5 minutos

### 6.3 Auto-eliminación Eventos Pasados
- **Frecuencia:** Diario 3:00 AM
- **Acción:** Eliminar eventos con fecha fin < hoy

---

## 7. NOTIFICACIONES EN TIEMPO REAL

### 7.1 WebSocket para Pedidos
- Canal: `/topic/pedidos/{restaurantId}`
- Eventos: cambio de estado pedido
- Clientes: Admin restaurant + Usuario que hizo pedido

### 7.2 WebSocket para Reservas
- Canal: `/topic/reservas/{hospedajeId}`
- Eventos: nueva reserva, cambio disponibilidad
- Clientes: Admin hospedaje

---

## 8. PRIORIDADES DE IMPLEMENTACIÓN

### Fase 1 (Crítica) - Sistema Base
1. ✅ Perfil usuario obligatorio
2. ✅ Validación perfil en transacciones
3. ✅ Modelo de datos Hospedaje completo
4. ✅ Sistema básico de reservas
5. ✅ Reglas de estancia mínima

### Fase 2 - Administración
6. ✅ Panel admin gastronomía mejorado
7. ✅ Gestión de menú completa
8. ✅ Panel admin hostelería mejorado
9. ✅ Gestión de habitaciones

### Fase 3 - Tiempo Real
10. ✅ Estados de pedidos
11. ✅ WebSocket para notificaciones
12. ✅ Actualización automática cliente

### Fase 4 - Mantenimiento
13. ✅ Cronjob limpieza MP
14. ✅ Cronjob liberación reservas
15. ✅ Sistema de logs y auditoría

---

## 9. STACK TECNOLÓGICO

### Backend
- Spring Boot 3.5.9
- Spring Data JPA
- Spring WebSocket (para tiempo real)
- Spring Scheduling (cronjobs)
- MySQL 8
- MongoDB (pedidos/reservas)

### Frontend
- React 18+
- React Router v7
- Bootstrap 5
- WebSocket client
- Axios/Fetch

### Infraestructura
- Docker & Docker Compose
- Eureka Server
- Spring Cloud Gateway
- JWT Authentication

