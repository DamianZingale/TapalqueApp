package com.tapalque.msvc_reservas.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.tapalque.msvc_reservas.dto.CustomerDTO;
import com.tapalque.msvc_reservas.dto.HotelDTO;
import com.tapalque.msvc_reservas.dto.PaymentDTO;
import com.tapalque.msvc_reservas.dto.ReservationDTO;
import com.tapalque.msvc_reservas.dto.StayPeriodDTO;
import com.tapalque.msvc_reservas.entity.Reservation;
import com.tapalque.msvc_reservas.repository.ReservationRepositoryInterface;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReservationServiceImpl Tests")

class ReservationServiceImplTest {

    @Mock
    private ReservationRepositoryInterface reservationRepository;

    @InjectMocks
    private ReservationServiceImpl reservationService;

    private Reservation testReservation;
    private ReservationDTO testReservationDTO;

    @BeforeEach
    void setUp() {
        Reservation.Customer customer = new Reservation.Customer();
        customer.setCustomerId("cust1");
        customer.setCustomerName("Juan Pérez");

        Reservation.Hotel hotel = new Reservation.Hotel();
        hotel.setHotelId("hotel1");
        hotel.setHotelName("Hotel Test");

        Reservation.StayPeriod stayPeriod = new Reservation.StayPeriod();
        stayPeriod.setCheckInDate(LocalDateTime.now().plusDays(1));
        stayPeriod.setCheckOutDate(LocalDateTime.now().plusDays(3));

        Reservation.Payment payment = new Reservation.Payment();
        payment.setTotalAmount(1000.0);
        payment.setAmountPaid(0.0);
        payment.setRemainingAmount(1000.0);
        payment.setIsPaid(false);
        payment.setHasPendingAmount(true);
        payment.setIsDeposit(false);

        testReservation = new Reservation();
        testReservation.setId("res123");
        testReservation.setCustomer(customer);
        testReservation.setHotel(hotel);
        testReservation.setStayPeriod(stayPeriod);
        testReservation.setPayment(payment);
        testReservation.setIsActive(true);
        testReservation.setIsCancelled(false);
        testReservation.setDateCreated(LocalDateTime.now());
        testReservation.setDateUpdated(LocalDateTime.now());

        CustomerDTO customerDTO = new CustomerDTO();
        customerDTO.setCustomerId("cust1");
        customerDTO.setCustomerName("Juan Pérez");

        HotelDTO hotelDTO = new HotelDTO();
        hotelDTO.setHotelId("hotel1");
        hotelDTO.setHotelName("Hotel Test");

        StayPeriodDTO stayPeriodDTO = new StayPeriodDTO();
        stayPeriodDTO.setCheckInDate(LocalDateTime.now().plusDays(1));
        stayPeriodDTO.setCheckOutDate(LocalDateTime.now().plusDays(3));

        PaymentDTO paymentDTO = new PaymentDTO();
        paymentDTO.setTotalAmount(1000.0);
        paymentDTO.setAmountPaid(0.0);
        paymentDTO.setRemainingAmount(1000.0);
        paymentDTO.setIsPaid(false);
        paymentDTO.setHasPendingAmount(true);
        paymentDTO.setIsDeposit(false);

        testReservationDTO = new ReservationDTO();
        testReservationDTO.setId("res123");
        testReservationDTO.setCustomer(customerDTO);
        testReservationDTO.setHotel(hotelDTO);
        testReservationDTO.setStayPeriod(stayPeriodDTO);
        testReservationDTO.setPayment(paymentDTO);

    }

    @Nested
    @DisplayName("Tests de createReservation")
    class CreateReservationTests {

        @Test
        @DisplayName("Debe crear reserva exitosamente")
        void createReservation_ConDatosValidos_RetornaReservationDTO() {
            // Given
            when(reservationRepository.save(any(Reservation.class)))
                    .thenReturn(Mono.just(testReservation));

            // When & Then
            StepVerifier.create(reservationService.createReservation(testReservationDTO))
                    .expectNextMatches(result ->
                        result.getId() != null )
                    .verifyComplete();

            verify(reservationRepository).save(any(Reservation.class));
        }
    }

    @Nested
    @DisplayName("Tests de getReservationById")
    class GetReservationByIdTests {

        @Test
        @DisplayName("Debe retornar reserva cuando existe")
        void getReservationById_ConIdExistente_RetornaReservation() {
            // Given
            when(reservationRepository.findAll()).thenReturn(Flux.just(testReservation));

            // When & Then
            StepVerifier.create(reservationService.getReservationById("res123"))
                    .expectNextMatches(result -> result.getId().equals("res123"))
                    .verifyComplete();
        }

        @Test
        @DisplayName("Debe retornar vacío cuando no existe")
        void getReservationById_ConIdNoExistente_RetornaVacio() {
            // Given
            when(reservationRepository.findAll()).thenReturn(Flux.just(testReservation));

            // When & Then
            StepVerifier.create(reservationService.getReservationById("noexiste"))
                    .verifyComplete();
        }
    }

    @Nested
    @DisplayName("Tests de updateReservation")
    class UpdateReservationTests {

        @Test
        @DisplayName("Debe actualizar reserva exitosamente")
        void updateReservation_ConDatosValidos_RetornaReservationActualizada() {
            // Given
            when(reservationRepository.findById("res123")).thenReturn(Mono.just(testReservation));
            when(reservationRepository.save(any(Reservation.class))).thenReturn(Mono.just(testReservation));

            // When & Then
            StepVerifier.create(reservationService.updateReservation(testReservationDTO))
                    .expectNextCount(1)
                    .verifyComplete();

            verify(reservationRepository).save(any(Reservation.class));
        }

        @Test
        @DisplayName("Debe lanzar error si ID es null")
        void updateReservation_ConIdNull_LanzaError() {
            // Given
            testReservationDTO.setId(null);

            // When & Then
            StepVerifier.create(reservationService.updateReservation(testReservationDTO))
                    .expectError(IllegalArgumentException.class)
                    .verify();
        }
    }

    @Nested
    @DisplayName("Tests de deleteReservation")
    class DeleteReservationTests {

        @Test
        @DisplayName("Debe eliminar reserva exitosamente")
        void deleteReservation_ConIdExistente_RetornaVoid() {
            // Given
            when(reservationRepository.deleteById("res123")).thenReturn(Mono.empty());

            // When & Then
            StepVerifier.create(reservationService.deleteReservation("res123"))
                    .verifyComplete();

            verify(reservationRepository).deleteById("res123");
        }
    }

    @Nested
    @DisplayName("Tests de getReservationsByHotel")
    class GetReservationsByHotelTests {

        @Test
        @DisplayName("Debe retornar reservas del hotel")
        void getReservationsByHotel_ConReservas_RetornaFlux() {
            // Given
            when(reservationRepository.findByHotel_HotelId("hotel1"))
                    .thenReturn(Flux.just(testReservation));

            // When & Then
            StepVerifier.create(reservationService.getReservationsByHotel("hotel1"))
                    .expectNextCount(1)
                    .verifyComplete();
        }

        @Test
        @DisplayName("Debe retornar vacío cuando no hay reservas")
        void getReservationsByHotel_SinReservas_RetornaFluxVacio() {
            // Given
            when(reservationRepository.findByHotel_HotelId("hotel999"))
                    .thenReturn(Flux.empty());

            // When & Then
            StepVerifier.create(reservationService.getReservationsByHotel("hotel999"))
                    .verifyComplete();
        }
    }

    @Nested
    @DisplayName("Tests de getReservationsByCustomer")
    class GetReservationsByCustomerTests {

        @Test
        @DisplayName("Debe retornar reservas del cliente")
        void getReservationsByCustomer_ConReservas_RetornaFlux() {
            // Given
            when(reservationRepository.findByCustomer_CustomerId("cust1"))
                    .thenReturn(Flux.just(testReservation));

            // When & Then
            StepVerifier.create(reservationService.getReservationsByCustomer("cust1"))
                    .expectNextCount(1)
                    .verifyComplete();
        }
    }

    @Nested
    @DisplayName("Tests de getReservationsByHotelAndDateRange")
    class GetReservationsByHotelAndDateRangeTests {

        @Test
        @DisplayName("Debe retornar reservas en rango de fechas")
        void getReservationsByHotelAndDateRange_ConReservas_RetornaFlux() {
            // Given
            LocalDateTime desde = LocalDateTime.now().minusDays(7);
            LocalDateTime hasta = LocalDateTime.now();
            when(reservationRepository.findByHotel_HotelIdAndDateCreatedBetween("hotel1", desde, hasta))
                    .thenReturn(Flux.just(testReservation));

            // When & Then
            StepVerifier.create(reservationService.getReservationsByHotelAndDateRange("hotel1", desde, hasta))
                    .expectNextCount(1)
                    .verifyComplete();
        }
    }
}
