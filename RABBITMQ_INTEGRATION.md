# Integración RabbitMQ - Transacciones Mercado Pago

## Estado Actual

✅ **RabbitMQ en Docker Compose**: Configurado y corriendo
✅ **Dependencia AMQP**: Ya incluida en pom.xml de los microservicios
✅ **Configuración de Colas**: IMPLEMENTADA en msvc-mercado-pago
✅ **Productores**: IMPLEMENTADOS en msvc-mercado-pago
✅ **Consumidores**: IMPLEMENTADOS en msvc-pedidos y msvc-reservas
✅ **Compilación**: Todos los microservicios compilan correctamente

## Arquitectura de Mensajería

### Flujo de Transacciones

```
msvc-mercado-pago (Producer)
    |
    ├─> Cola: pagos.pedidos  ──> msvc-pedidos (Consumer)
    |
    └─> Cola: pagos.reservas ──> msvc-reservas (Consumer)
```

### Colas y Exchanges

1. **Exchange**: `pagos.exchange` (tipo: direct)
2. **Colas**:
   - `pagos.pedidos` (routing key: `pago.pedido`)
   - `pagos.reservas` (routing key: `pago.reserva`)

## Implementación Requerida

### 1. msvc-mercado-pago (Productor)

#### application.properties
```properties
spring.rabbitmq.host=rabbitmq
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest
```

#### RabbitMQConfig.java
```java
@Configuration
public class RabbitMQConfig {
    public static final String EXCHANGE_NAME = "pagos.exchange";
    public static final String QUEUE_PEDIDOS = "pagos.pedidos";
    public static final String QUEUE_RESERVAS = "pagos.reservas";
    public static final String ROUTING_KEY_PEDIDOS = "pago.pedido";
    public static final String ROUTING_KEY_RESERVAS = "pago.reserva";

    @Bean
    public DirectExchange pagosExchange() {
        return new DirectExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue pedidosQueue() {
        return new Queue(QUEUE_PEDIDOS, true); // durable
    }

    @Bean
    public Queue reservasQueue() {
        return new Queue(QUEUE_RESERVAS, true); // durable
    }

    @Bean
    public Binding bindingPedidos() {
        return BindingBuilder
            .bind(pedidosQueue())
            .to(pagosExchange())
            .with(ROUTING_KEY_PEDIDOS);
    }

    @Bean
    public Binding bindingReservas() {
        return BindingBuilder
            .bind(reservasQueue())
            .to(pagosExchange())
            .with(ROUTING_KEY_RESERVAS);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
```

#### PagoEventoDTO.java (DTO para mensajes)
```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PagoEventoDTO implements Serializable {
    private Long transaccionId;
    private Long referenciaId; // ID del pedido o reserva
    private String tipo; // "PEDIDO" o "RESERVA"
    private String estado; // "APROBADO", "RECHAZADO", "PENDIENTE"
    private BigDecimal monto;
    private String mercadoPagoId;
    private Long userId;
    private LocalDateTime fechaPago;
}
```

#### PagoProducerService.java
```java
@Service
@Slf4j
public class PagoProducerService {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void enviarNotificacionPagoPedido(PagoEventoDTO evento) {
        try {
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.ROUTING_KEY_PEDIDOS,
                evento
            );
            log.info("Enviado evento de pago pedido ID: {}", evento.getReferenciaId());
        } catch (Exception e) {
            log.error("Error al enviar evento de pago pedido", e);
        }
    }

    public void enviarNotificacionPagoReserva(PagoEventoDTO evento) {
        try {
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.ROUTING_KEY_RESERVAS,
                evento
            );
            log.info("Enviado evento de pago reserva ID: {}", evento.getReferenciaId());
        } catch (Exception e) {
            log.error("Error al enviar evento de pago reserva", e);
        }
    }
}
```

#### Integración en MercadoPagoService
```java
@Service
public class MercadoPagoService {

    @Autowired
    private PagoProducerService pagoProducerService;

    public void procesarWebhook(WebhookDTO webhook) {
        // ... lógica existente ...

        // Después de confirmar el pago
        if (transaccion.getEstado() == EstadoTransaccion.APROBADA) {
            PagoEventoDTO evento = new PagoEventoDTO(
                transaccion.getId(),
                transaccion.getReferenciaId(),
                transaccion.getTipo().name(),
                "APROBADO",
                transaccion.getMonto(),
                transaccion.getMercadoPagoId(),
                transaccion.getUserId(),
                LocalDateTime.now()
            );

            if (transaccion.getTipo() == TipoTransaccion.PEDIDO) {
                pagoProducerService.enviarNotificacionPagoPedido(evento);
            } else if (transaccion.getTipo() == TipoTransaccion.RESERVA) {
                pagoProducerService.enviarNotificacionPagoReserva(evento);
            }
        }
    }
}
```

### 2. msvc-pedidos (Consumidor)

#### application.properties
```properties
spring.rabbitmq.host=rabbitmq
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest
```

#### PedidoRabbitListener.java
```java
@Component
@Slf4j
public class PedidoRabbitListener {

    @Autowired
    private PedidoService pedidoService;

    @RabbitListener(queues = "pagos.pedidos")
    public void recibirPagoPedido(PagoEventoDTO evento) {
        try {
            log.info("Recibido evento de pago para pedido ID: {}", evento.getReferenciaId());

            if ("APROBADO".equals(evento.getEstado())) {
                pedidoService.confirmarPagoPedido(evento.getReferenciaId(), evento);
            } else if ("RECHAZADO".equals(evento.getEstado())) {
                pedidoService.rechazarPagoPedido(evento.getReferenciaId(), evento);
            }

            log.info("Pedido ID {} actualizado con estado: {}",
                     evento.getReferenciaId(), evento.getEstado());
        } catch (Exception e) {
            log.error("Error al procesar evento de pago pedido", e);
            throw e; // Para reintento automático
        }
    }
}
```

#### Actualizar PedidoService
```java
@Service
public class PedidoService {

    @Transactional
    public void confirmarPagoPedido(Long pedidoId, PagoEventoDTO evento) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new PedidoNotFoundException(pedidoId));

        pedido.setEstadoPago(EstadoPago.PAGADO);
        pedido.setEstadoPedido(EstadoPedido.PENDIENTE); // Espera preparación
        pedido.setTransaccionId(evento.getTransaccionId());
        pedido.setFechaPago(evento.getFechaPago());

        pedidoRepository.save(pedido);

        // Notificar al restaurant por WebSocket
        notificarNuevoPedido(pedido);
    }

    @Transactional
    public void rechazarPagoPedido(Long pedidoId, PagoEventoDTO evento) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new PedidoNotFoundException(pedidoId));

        pedido.setEstadoPago(EstadoPago.RECHAZADO);
        pedido.setEstadoPedido(EstadoPedido.CANCELADO);

        pedidoRepository.save(pedido);
    }
}
```

### 3. msvc-reservas (Consumidor)

#### application.properties
```properties
spring.rabbitmq.host=rabbitmq
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest
```

#### ReservaRabbitListener.java
```java
@Component
@Slf4j
public class ReservaRabbitListener {

    @Autowired
    private ReservaService reservaService;

    @RabbitListener(queues = "pagos.reservas")
    public void recibirPagoReserva(PagoEventoDTO evento) {
        try {
            log.info("Recibido evento de pago para reserva ID: {}", evento.getReferenciaId());

            if ("APROBADO".equals(evento.getEstado())) {
                reservaService.confirmarPagoReserva(evento.getReferenciaId(), evento);
            } else if ("RECHAZADO".equals(evento.getEstado())) {
                reservaService.rechazarPagoReserva(evento.getReferenciaId(), evento);
            }

            log.info("Reserva ID {} actualizada con estado: {}",
                     evento.getReferenciaId(), evento.getEstado());
        } catch (Exception e) {
            log.error("Error al procesar evento de pago reserva", e);
            throw e; // Para reintento automático
        }
    }
}
```

#### Actualizar ReservaService
```java
@Service
public class ReservaService {

    @Transactional
    public void confirmarPagoReserva(Long reservaId, PagoEventoDTO evento) {
        Reserva reserva = reservaRepository.findById(reservaId)
            .orElseThrow(() -> new ReservaNotFoundException(reservaId));

        // Cambiar de BLOQUEADA_TEMPORAL a CONFIRMADA
        reserva.setEstadoReserva(EstadoReserva.CONFIRMADA);
        reserva.setEstadoPago(EstadoPago.PAGADO);
        reserva.setTransaccionId(evento.getTransaccionId());
        reserva.setFechaPago(evento.getFechaPago());

        reservaRepository.save(reserva);

        // Actualizar disponibilidad
        actualizarDisponibilidad(reserva);

        // Notificar al hospedaje por WebSocket
        notificarNuevaReserva(reserva);
    }

    @Transactional
    public void rechazarPagoReserva(Long reservaId, PagoEventoDTO evento) {
        Reserva reserva = reservaRepository.findById(reservaId)
            .orElseThrow(() -> new ReservaNotFoundException(reservaId));

        // Liberar la reserva
        reserva.setEstadoReserva(EstadoReserva.CANCELADA);
        reserva.setEstadoPago(EstadoPago.RECHAZADO);

        reservaRepository.save(reserva);

        // Liberar disponibilidad
        liberarDisponibilidad(reserva);
    }
}
```

## Testing

### Panel de Gestión RabbitMQ
- URL: http://localhost:15672
- Usuario: guest
- Password: guest

### Verificar Colas
```bash
docker exec -it rabbitmq rabbitmqctl list_queues
```

### Monitorear Mensajes
```bash
docker exec -it rabbitmq rabbitmqctl list_queues name messages messages_ready messages_unacknowledged
```

## Ventajas de esta Arquitectura

1. **Desacoplamiento**: MP no necesita conocer Pedidos/Reservas directamente
2. **Confiabilidad**: RabbitMQ garantiza entrega de mensajes
3. **Escalabilidad**: Múltiples instancias pueden consumir de las colas
4. **Reintentos Automáticos**: Si falla el consumidor, RabbitMQ reintenta
5. **Auditoría**: Todos los eventos quedan registrados

## Próximos Pasos

1. ✅ Verificar RabbitMQ corriendo
2. ⚠️ Agregar dependencia AMQP (YA EXISTE)
3. ❌ Implementar configuración en cada microservicio
4. ❌ Crear clases Producer/Consumer
5. ❌ Integrar con lógica existente
6. ❌ Probar flujo completo
7. ❌ Agregar manejo de errores y reintentos
8. ❌ Configurar Dead Letter Queue para mensajes fallidos
