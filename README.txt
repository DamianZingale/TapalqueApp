# TapalqueApp

Plataforma web full-stack para la gestión de turismo, gastronomía y comercio local del municipio de Tapalqué, Argentina. Conecta a los usuarios con los negocios de la ciudad: hospedajes, restaurantes, comercios, servicios, eventos, termas y espacios públicos.

**Producción:** [www.tapalqueapp.com.ar](https://www.tapalqueapp.com.ar)

---

## Arquitectura

Aplicación distribuida en **microservicios** con frontend desacoplado. Cada dominio de negocio tiene su propio servicio, base de datos y ciclo de despliegue independiente.

```
                        ┌──────────────┐
                        │   React SPA  │
                        │  (Vite/TS)   │
                        └──────┬───────┘
                               │ HTTP / WebSocket
                        ┌──────▼───────┐
                        │ API Gateway  │  ← JWT Filter
                        │  port 8090   │
                        └──────┬───────┘
                               │ Eureka Service Discovery
          ┌────────────────────┼────────────────────┐
          │                    │                    │
   ┌──────▼──────┐    ┌────────▼───────┐   ┌───────▼──────┐
   │  msvc-jwt   │    │ msvc-gastrono. │   │ msvc-hostel. │  ...
   │  msvc-user  │    │ msvc-pedidos   │   │ msvc-reservas│
   └──────┬──────┘    └────────┬───────┘   └───────┬──────┘
          │                    │                    │
       MySQL              MongoDB               MySQL
                               │
                    ┌──────────┴──────────┐
                 RabbitMQ               Redis
```

---

## Stack Tecnológico

### Frontend

| Tecnología          | Versión | Uso                            |
| ------------------- | ------- | ------------------------------ |
| React               | 19      | UI framework                   |
| TypeScript          | 5.8     | Tipado estático                |
| Vite                | 7       | Build tool + dev server        |
| React Router        | 7       | SPA routing                    |
| Bootstrap           | 5.3     | UI components                  |
| Axios               | 1.11    | HTTP client + interceptors JWT |
| STOMP / SockJS      | 7.3     | WebSocket real-time            |
| jsPDF               | —       | Generación de reportes PDF     |
| Vitest + Playwright | —       | Testing unitario y E2E         |

### Backend

| Tecnología            | Versión | Uso                          |
| --------------------- | ------- | ---------------------------- |
| Java                  | 21      | Lenguaje base                |
| Spring Boot           | 3.5     | Framework microservicios     |
| Spring Cloud (Eureka) | 2025.0  | Service discovery            |
| Spring Cloud Gateway  | —       | API Gateway + JWT filter     |
| Spring Data JPA       | —       | ORM para MySQL               |
| Spring Data MongoDB   | —       | ODM para MongoDB             |
| Spring AMQP           | —       | Mensajería con RabbitMQ      |
| Spring Cache + Redis  | —       | Caché de consultas           |
| Spring Security       | —       | Autenticación y autorización |

### Infraestructura

| Tecnología              | Uso                                         |
| ----------------------- | ------------------------------------------- |
| Docker + Docker Compose | Contenerización de 20+ servicios            |
| MySQL 8                 | 10 bases de datos independientes            |
| MongoDB                 | Pedidos y reservas (datos no estructurados) |
| RabbitMQ                | Mensajería asíncrona entre microservicios   |
| Redis                   | Caché con política LRU                      |
| Nginx                   | Reverse proxy y serving del frontend        |

---

## Microservicios

| Servicio                 | Responsabilidad                               | DB      |
| ------------------------ | --------------------------------------------- | ------- |
| `eureka-server`          | Service discovery y registro                  | —       |
| `msvc-gateway-server`    | API Gateway, filtro JWT                       | —       |
| `msvc-jwt`               | Autenticación, emisión y validación de tokens | MySQL   |
| `msvc-user`              | Gestión de usuarios y perfiles                | MySQL   |
| `msvc-gastronomia`       | Restaurantes, menús, delivery                 | MySQL   |
| `msvc-hosteleria`        | Hospedajes y habitaciones                     | MySQL   |
| `msvc-pedidos`           | Gestión de pedidos                            | MongoDB |
| `msvc-reservas`          | Gestión de reservas                           | MongoDB |
| `msvc-mercado-pago`      | Integración de pagos                          | MySQL   |
| `msvc-comercio`          | Comercios locales                             | MySQL   |
| `msvc-servicios`         | Servicios profesionales                       | MySQL   |
| `msvc-eventos`           | Eventos municipales                           | MySQL   |
| `msvc-termas`            | Complejo termal                               | MySQL   |
| `msvc-espacios-publicos` | Espacios públicos                             | MySQL   |

---

## Funcionalidades Principales

- **Autenticación JWT** con refresh automático de tokens y control de roles (Admin / Moderador / Usuario)
- **Notificaciones en tiempo real** via WebSocket (STOMP) para pedidos y reservas
- **Pagos integrados** con Mercado Pago y webhooks para actualización de estado
- **Mensajería asíncrona** con RabbitMQ entre `msvc-mercado-pago` → `msvc-pedidos` / `msvc-reservas`
- **Caché con Redis** para reducir carga en las consultas frecuentes (TTL: 300s)
- **Gestión de imágenes** por entidad (restaurantes, hospedajes, habitaciones, menús)
- **Panel de administración** con estadísticas y gestión de negocios
- **Panel de moderador** con revisión y aprobación de contenido
- **Reportes exportables** en PDF
- **Geolocalización** para filtros por proximidad

---

## Estructura del Proyecto

```
TapalqueApp/
├── portal Frontend/
│   └── src/
│       ├── features/          # 14 módulos feature-based
│       │   ├── auth/
│       │   ├── gastronomia/
│       │   ├── hospedaje/
│       │   ├── comercio/
│       │   ├── eventos/
│       │   ├── pago/
│       │   └── ...
│       ├── shared/
│       │   ├── components/    # NavBar, Cards, ImageManager, etc.
│       │   ├── context/       # NotificationContext (WebSocket)
│       │   ├── hooks/         # useUserLocation
│       │   ├── services/      # Capa de API centralizada
│       │   └── types/         # Interfaces TypeScript globales
│       └── config/
│           └── api.ts         # Axios con interceptores JWT
│
├── portal Backend/
│   ├── eureka-server/
│   ├── msvc-gateway-server/
│   ├── msvc-jwt/
│   ├── msvc-user/
│   ├── msvc-gastronomia/
│   ├── msvc-hosteleria/
│   ├── msvc-pedidos/
│   ├── msvc-reservas/
│   ├── msvc-mercado-pago/
│   ├── msvc-comercio/
│   ├── msvc-servicios/
│   ├── msvc-eventos/
│   ├── msvc-termas/
│   └── msvc-espacios-publicos/
│
├── docker-compose.yml
├── docker-compose.prod.yml
└── deploy.sh
```

---

## Despliegue Local

**Requisitos:** Docker + Docker Compose

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/TapalqueApp.git
cd TapalqueApp

# Configurar variables de entorno
cp .env.production.example .env

# Levantar todos los servicios
docker compose up --build
```

| Servicio            | URL                    |
| ------------------- | ---------------------- |
| Frontend            | http://localhost:3000  |
| API Gateway         | http://localhost:8090  |
| Eureka Dashboard    | http://localhost:8761  |
| RabbitMQ Management | http://localhost:15672 |

---

## Flujo de Autenticación

```
POST /api/jwt/public/login
        ↓
  JWT emitido (24h)
        ↓
Authorization: Bearer <token>  →  API Gateway valida
        ↓
Interceptor Axios detecta 401  →  Refresh automático
```

---

## Flujo de Pago

```
Usuario confirma pedido/reserva
        ↓
msvc-mercado-pago crea preferencia de pago
        ↓
Webhook de Mercado Pago confirma pago
        ↓
RabbitMQ publica evento  →  msvc-pedidos / msvc-reservas actualiza estado
        ↓
WebSocket notifica al negocio en tiempo real
```

---

_Proyecto en producción desde febrero 2026._
