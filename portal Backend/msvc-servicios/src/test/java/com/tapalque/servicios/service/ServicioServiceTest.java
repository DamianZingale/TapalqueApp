package com.tapalque.servicios.service;

import com.tapalque.servicios.Exceptions.ServicioNotFoundException;
import com.tapalque.servicios.dto.ServicioRequestDTO;
import com.tapalque.servicios.dto.ServicioResponseDTO;
import com.tapalque.servicios.entity.Servicio;
import com.tapalque.servicios.repository.ServicioRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ServicioService Tests")
class ServicioServiceTest {

    @Mock
    private ServicioRepository servicioRepository;

    @InjectMocks
    private ServicioService servicioService;

    private Servicio testServicio;
    private ServicioRequestDTO testRequestDTO;

    @BeforeEach
    void setUp() {
        testServicio = new Servicio();
        testServicio.setId(1L);
        testServicio.setTitulo("Servicio de Plomería");
        testServicio.setDescripcion("Servicio profesional de plomería");
        testServicio.setDireccion("Calle 123");
        testServicio.setHorario("8:00 - 18:00");
        testServicio.setTelefono("+5491234567890");
        testServicio.setLatitud(-36.3629);
        testServicio.setLongitud(-60.0243);
        testServicio.setImagenes(Collections.emptyList());

        testRequestDTO = new ServicioRequestDTO();
        testRequestDTO.setTitulo("Servicio de Plomería");
        testRequestDTO.setDescripcion("Servicio profesional de plomería");
        testRequestDTO.setDireccion("Calle 123");
        testRequestDTO.setHorario("8:00 - 18:00");
        testRequestDTO.setTelefono("+5491234567890");
        testRequestDTO.setLatitud(-36.3629);
        testRequestDTO.setLongitud(-60.0243);
    }

    @Nested
    @DisplayName("Tests de crear")
    class CrearTests {

        @Test
        @DisplayName("Debe crear servicio con datos válidos")
        void crear_ConDatosValidos_RetornaServicioResponseDTO() {
            // Given
            when(servicioRepository.save(any(Servicio.class))).thenAnswer(invocation -> {
                Servicio saved = invocation.getArgument(0);
                saved.setId(1L);
                saved.setImagenes(Collections.emptyList());
                return saved;
            });

            // When
            ServicioResponseDTO result = servicioService.crear(testRequestDTO);

            // Then
            assertNotNull(result);
            assertEquals("Servicio de Plomería", result.getTitulo());
            verify(servicioRepository).save(any(Servicio.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si título es null")
        void crear_ConTituloNull_LanzaExcepcion() {
            // Given
            testRequestDTO.setTitulo(null);

            // When & Then
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> servicioService.crear(testRequestDTO)
            );
            assertEquals("El título del servicio es obligatorio", exception.getMessage());
            verify(servicioRepository, never()).save(any(Servicio.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si título está vacío")
        void crear_ConTituloVacio_LanzaExcepcion() {
            // Given
            testRequestDTO.setTitulo("   ");

            // When & Then
            assertThrows(IllegalArgumentException.class, () -> servicioService.crear(testRequestDTO));
            verify(servicioRepository, never()).save(any(Servicio.class));
        }
    }

    @Nested
    @DisplayName("Tests de obtenerTodos")
    class ObtenerTodosTests {

        @Test
        @DisplayName("Debe retornar lista de servicios")
        void obtenerTodos_ConServicios_RetornaLista() {
            // Given
            Servicio servicio2 = new Servicio();
            servicio2.setId(2L);
            servicio2.setTitulo("Electricista");
            servicio2.setImagenes(Collections.emptyList());

            when(servicioRepository.findAll()).thenReturn(Arrays.asList(testServicio, servicio2));

            // When
            List<ServicioResponseDTO> result = servicioService.obtenerTodos();

            // Then
            assertNotNull(result);
            assertEquals(2, result.size());
            verify(servicioRepository).findAll();
        }

        @Test
        @DisplayName("Debe retornar lista vacía cuando no hay servicios")
        void obtenerTodos_SinServicios_RetornaListaVacia() {
            // Given
            when(servicioRepository.findAll()).thenReturn(Collections.emptyList());

            // When
            List<ServicioResponseDTO> result = servicioService.obtenerTodos();

            // Then
            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("Tests de obtenerPorId")
    class ObtenerPorIdTests {

        @Test
        @DisplayName("Debe retornar servicio cuando existe")
        void obtenerPorId_ConIdExistente_RetornaServicio() {
            // Given
            when(servicioRepository.findById(1L)).thenReturn(Optional.of(testServicio));

            // When
            ServicioResponseDTO result = servicioService.obtenerPorId(1L);

            // Then
            assertNotNull(result);
            assertEquals("Servicio de Plomería", result.getTitulo());
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando no existe")
        void obtenerPorId_ConIdNoExistente_LanzaExcepcion() {
            // Given
            when(servicioRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(ServicioNotFoundException.class, () -> servicioService.obtenerPorId(999L));
        }
    }

    @Nested
    @DisplayName("Tests de actualizarCompleto")
    class ActualizarCompletoTests {

        @Test
        @DisplayName("Debe actualizar servicio completamente")
        void actualizarCompleto_ConDatosValidos_RetornaServicioActualizado() {
            // Given
            when(servicioRepository.findById(1L)).thenReturn(Optional.of(testServicio));
            when(servicioRepository.save(any(Servicio.class))).thenAnswer(invocation -> {
                Servicio saved = invocation.getArgument(0);
                saved.setImagenes(Collections.emptyList());
                return saved;
            });

            // When
            ServicioResponseDTO result = servicioService.actualizarCompleto(1L, testRequestDTO);

            // Then
            assertNotNull(result);
            verify(servicioRepository).save(any(Servicio.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si servicio no existe")
        void actualizarCompleto_ConIdNoExistente_LanzaExcepcion() {
            // Given
            when(servicioRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(ServicioNotFoundException.class,
                    () -> servicioService.actualizarCompleto(999L, testRequestDTO));
        }
    }

    @Nested
    @DisplayName("Tests de eliminar")
    class EliminarTests {

        @Test
        @DisplayName("Debe eliminar servicio existente")
        void eliminar_ConIdExistente_EliminaServicio() {
            // Given
            when(servicioRepository.findById(1L)).thenReturn(Optional.of(testServicio));
            doNothing().when(servicioRepository).delete(testServicio);

            // When
            assertDoesNotThrow(() -> servicioService.eliminar(1L));

            // Then
            verify(servicioRepository).delete(testServicio);
        }

        @Test
        @DisplayName("Debe lanzar excepción si servicio no existe")
        void eliminar_ConIdNoExistente_LanzaExcepcion() {
            // Given
            when(servicioRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(ServicioNotFoundException.class, () -> servicioService.eliminar(999L));
        }
    }
}
