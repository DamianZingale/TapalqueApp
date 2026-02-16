package com.tapalque.msvc_pedidos.service;

import com.tapalque.msvc_pedidos.dto.ItemDTO;
import com.tapalque.msvc_pedidos.dto.OrderDTO;
import com.tapalque.msvc_pedidos.dto.RestaurantDTO;
import com.tapalque.msvc_pedidos.entity.Order;
import com.tapalque.msvc_pedidos.repository.OrderRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.LocalDateTime;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderServiceImpl Tests")
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private org.springframework.amqp.rabbit.core.RabbitTemplate rabbitTemplate;

    @Mock
    private AdminNotificationService adminNotificationService;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Order testOrder;
    private OrderDTO testOrderDTO;

    @BeforeEach
    void setUp() {
        Order.Item item = new Order.Item("prod1", "Pizza", 1500.0, 2);
        Order.Restaurant restaurant = new Order.Restaurant("rest1", "Pizzería Test");

        testOrder = new Order();
        testOrder.setId("order123");
        testOrder.setTotalPrice(3000.0);
        testOrder.setPaidWithMercadoPago(false);
        testOrder.setPaidWithCash(false);
        testOrder.setStatus(Order.OrderStatus.RECIBIDO);
        testOrder.setItems(Arrays.asList(item));
        testOrder.setRestaurant(restaurant);
        testOrder.setDateCreated(LocalDateTime.now());
        testOrder.setDateUpdated(LocalDateTime.now());

        ItemDTO itemDTO = new ItemDTO();
        itemDTO.setProductId("prod1");
        itemDTO.setItemName("Pizza");
        itemDTO.setItemPrice(1500.0);
        itemDTO.setItemQuantity(2);

        RestaurantDTO restaurantDTO = new RestaurantDTO();
        restaurantDTO.setRestaurantId("rest1");
        restaurantDTO.setRestaurantName("Pizzería Test");

        testOrderDTO = new OrderDTO();
        testOrderDTO.setId("order123");
        testOrderDTO.setTotalPrice(3000.0);
        testOrderDTO.setPaidWithMercadoPago(false);
        testOrderDTO.setPaidWithCash(false);
        testOrderDTO.setStatus("RECIBIDO");
        testOrderDTO.setItems(Arrays.asList(itemDTO));
        testOrderDTO.setRestaurant(restaurantDTO);
    }

    @Nested
    @DisplayName("Tests de createOrder")
    class CreateOrderTests {

        @Test
        @DisplayName("Debe crear pedido exitosamente")
        void createOrder_ConDatosValidos_RetornaOrderDTO() {
            // Given
            when(orderRepository.save(any(Order.class))).thenReturn(Mono.just(testOrder));

            // When & Then
            StepVerifier.create(orderService.createOrder(testOrderDTO))
                    .expectNextMatches(result ->
                        result.getTotalPrice().equals(3000.0) &&
                        result.getStatus().equals("RECIBIDO"))
                    .verifyComplete();

            verify(orderRepository).save(any(Order.class));
        }
    }

    @Nested
    @DisplayName("Tests de getOrderById")
    class GetOrderByIdTests {

        @Test
        @DisplayName("Debe retornar pedido cuando existe")
        void getOrderById_ConIdExistente_RetornaOrder() {
            // Given
            when(orderRepository.findById("order123")).thenReturn(Mono.just(testOrder));

            // When & Then
            StepVerifier.create(orderService.getOrderById("order123"))
                    .expectNextMatches(result -> result.getId().equals("order123"))
                    .verifyComplete();

            verify(orderRepository).findById("order123");
        }

        @Test
        @DisplayName("Debe retornar vacío cuando no existe")
        void getOrderById_ConIdNoExistente_RetornaVacio() {
            // Given
            when(orderRepository.findById("noexiste")).thenReturn(Mono.empty());

            // When & Then
            StepVerifier.create(orderService.getOrderById("noexiste"))
                    .verifyComplete();
        }
    }

    @Nested
    @DisplayName("Tests de getOrdersByRestaurant")
    class GetOrdersByRestaurantTests {

        @Test
        @DisplayName("Debe retornar pedidos del restaurante")
        void getOrdersByRestaurant_ConPedidos_RetornaFlux() {
            // Given
            when(orderRepository.findByRestaurant_RestaurantId("rest1"))
                    .thenReturn(Flux.just(testOrder));

            // When & Then
            StepVerifier.create(orderService.getOrdersByRestaurant("rest1"))
                    .expectNextMatches(result ->
                        result.getRestaurant().getRestaurantId().equals("rest1"))
                    .verifyComplete();
        }

        @Test
        @DisplayName("Debe retornar vacío cuando no hay pedidos")
        void getOrdersByRestaurant_SinPedidos_RetornaFluxVacio() {
            // Given
            when(orderRepository.findByRestaurant_RestaurantId("rest999"))
                    .thenReturn(Flux.empty());

            // When & Then
            StepVerifier.create(orderService.getOrdersByRestaurant("rest999"))
                    .verifyComplete();
        }
    }

    @Nested
    @DisplayName("Tests de getOrdersByUser")
    class GetOrdersByUserTests {

        @Test
        @DisplayName("Debe retornar pedidos del usuario")
        void getOrdersByUser_ConPedidos_RetornaFlux() {
            // Given
            testOrder.setUserId("user1");
            when(orderRepository.findByUserId("user1")).thenReturn(Flux.just(testOrder));

            // When & Then
            StepVerifier.create(orderService.getOrdersByUser("user1"))
                    .expectNextCount(1)
                    .verifyComplete();
        }
    }

    @Nested
    @DisplayName("Tests de updateOrder")
    class UpdateOrderTests {

        @Test
        @DisplayName("Debe actualizar pedido exitosamente")
        void updateOrder_ConDatosValidos_RetornaOrderActualizado() {
            // Given
            when(orderRepository.save(any(Order.class))).thenReturn(Mono.just(testOrder));

            // When & Then
            StepVerifier.create(orderService.updateOrder(testOrderDTO))
                    .expectNextMatches(result -> result.getId().equals("order123"))
                    .verifyComplete();

            verify(orderRepository).save(any(Order.class));
        }
    }

    @Nested
    @DisplayName("Tests de deleteOrder")
    class DeleteOrderTests {

        @Test
        @DisplayName("Debe eliminar pedido exitosamente")
        void deleteOrder_ConIdExistente_RetornaVoid() {
            // Given
            when(orderRepository.deleteById("order123")).thenReturn(Mono.empty());

            // When & Then
            StepVerifier.create(orderService.deleteOrder("order123"))
                    .verifyComplete();

            verify(orderRepository).deleteById("order123");
        }
    }

    @Nested
    @DisplayName("Tests de getOrdersByRestaurantAndDateRange")
    class GetOrdersByRestaurantAndDateRangeTests {

        @Test
        @DisplayName("Debe retornar pedidos en rango de fechas")
        void getOrdersByRestaurantAndDateRange_ConPedidos_RetornaFlux() {
            // Given
            LocalDateTime desde = LocalDateTime.now().minusDays(7);
            LocalDateTime hasta = LocalDateTime.now();
            when(orderRepository.findByRestaurant_RestaurantIdAndDateCreatedBetween("rest1", desde, hasta))
                    .thenReturn(Flux.just(testOrder));

            // When & Then
            StepVerifier.create(orderService.getOrdersByRestaurantAndDateRange("rest1", desde, hasta))
                    .expectNextCount(1)
                    .verifyComplete();
        }
    }
}
