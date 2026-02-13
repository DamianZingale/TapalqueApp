# Implementación RabbitMQ - Completada ✅

## Resumen

Se implementó exitosamente la integración de RabbitMQ para manejar eventos de pago entre microservicios.

## Arquitectura Implementada

```
msvc-mercado-pago (Producer)
    |
    ├─> Exchange: pagos.exchange (direct)
    |       |
    |       ├─> Cola: pagos.pedidos (routing key: pago.pedido) ──> msvc-pedidos (Consumer)
    |       |
    |       └─> Cola: pagos.reservas (routing key: pago.reserva) ──> msvc-reservas (Consumer)
```

## Archivos Creados/Modificados

### 1. msvc-mercado-pago (Productor)

#### Archivos Nuevos:
- `config/RabbitMQConfig.java` - Configuración de exchanges, colas y bindings
- `service/PagoProducerService.java` - Servicio para enviar mensajes a RabbitMQ
- `dto/PagoEventoDTO.java` - DTO para los eventos de pago

#### Archivos Modificados:
- `entity/Transaccion.java` - Agregados campos: monto, mercadoPagoId, fechaPago
- `service/MercadoPagoService.java` - Integrado PagoProducerService para enviar eventos
- `resources/application.properties` - Agregada configuración de RabbitMQ

### 2. msvc-pedidos (Consumidor)

#### Archivos Nuevos:
- `dto/PagoEventoDTO.java` - DTO para recibir eventos de pago
- `listener/PedidoRabbitListener.java` - Listener para consumir mensajes de la cola
- `config/RabbitMQConfig.java` - Configuración del conversor de mensajes

#### Archivos Modificados:
- `entity/Order.java` - Agregados campos: transaccionId, mercadoPagoId, fechaPago
- `service/OrderService.java` - Agregados métodos: confirmarPagoPedido, rechazarPagoPedido
- `service/OrderServiceImpl.java` - Implementados métodos de confirmación/rechazo de pago
- `resources/application.properties` - Agregada configuración de RabbitMQ

### 3. msvc-reservas (Consumidor)

#### Archivos Nuevos:
- `dto/PagoEventoDTO.java` - DTO para recibir eventos de pago
- `listener/ReservaRabbitListener.java` - Listener para consumir mensajes de la cola
- `config/RabbitMQConfig.java` - Configuración del conversor de mensajes

#### Archivos Modificados:
- `entity/Reservation.java` - Agregados campos: transaccionId, mercadoPagoId, fechaPago
- `service/ReservationService.java` - Agregados métodos: confirmarPagoReserva, rechazarPagoReserva
- `service/ReservationServiceImpl.java` - Implementados métodos de confirmación/rechazo de pago
- `resources/application.properties` - Ya tenía configuración de RabbitMQ

## Flujo de Eventos

### Cuando un pago es aprobado:

1. **Mercado Pago Webhook** llega a `msvc-mercado-pago`
2. **MercadoPagoService** verifica el pago:
   - Actualiza el estado de la transacción a "Pago"
   - Guarda mercadoPagoId y fechaPago
3. **PagoProducerService** crea un PagoEventoDTO con:
   - transaccionId
   - referenciaId (ID del pedido/reserva)
   - tipo (GASTRONOMICO/HOSPEDAJE)
   - estado (APROBADO/RECHAZADO)
   - monto
   - mercadoPagoId
   - userId
   - fechaPago
4. El evento se envía al **exchange** con el routing key correspondiente
5. El exchange enruta el mensaje a la cola correspondiente
6. El **consumidor** (msvc-pedidos o msvc-reservas) recibe el mensaje:
   - **APROBADO**: Actualiza el estado a PAGADO, marca como activo
   - **RECHAZADO**: Marca como cancelado o rechazado

## Estado RabbitMQ

### Exchanges:
- ✅ `pagos.exchange` (tipo: direct, durable)

### Colas:
- ✅ `pagos.pedidos` (durable, 1 consumidor activo)
- ✅ `pagos.reservas` (durable, 1 consumidor activo)

### Bindings:
- ✅ `pagos.exchange` → `pagos.pedidos` (routing key: `pago.pedido`)
- ✅ `pagos.exchange` → `pagos.reservas` (routing key: `pago.reserva`)

## Configuración

### RabbitMQ Connection (todos los microservicios):
```properties
spring.rabbitmq.host=rabbitmq
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest
```

## Testing

### Panel de Gestión RabbitMQ:
- **URL**: http://localhost:15672
- **Usuario**: guest
- **Password**: guest

### Verificar Colas:
```bash
docker exec rabbitmq rabbitmqctl list_queues name messages consumers
```

### Ver Exchanges:
```bash
docker exec rabbitmq rabbitmqctl list_exchanges
```

### Ver Bindings:
```bash
docker exec rabbitmq rabbitmqctl list_bindings
```

## Próximos Pasos Sugeridos

1. **Testing End-to-End**: Probar flujo completo con webhook real de Mercado Pago
2. **Dead Letter Queue**: Configurar DLQ para mensajes que fallen
3. **Reintentos**: Configurar política de reintentos automáticos
4. **Monitoring**: Agregar métricas de RabbitMQ en dashboard
5. **Logging**: Mejorar logs para tracking de mensajes

## Notas Importantes

- Los consumidores están configurados para reintentar automáticamente si hay errores (throw exception)
- Los mensajes se serializan/deserializan automáticamente usando Jackson
- Las transacciones se persisten antes de enviar el evento (evita pérdida de datos)
- Si un consumidor falla, RabbitMQ mantiene el mensaje en la cola hasta que se procese exitosamente
