package com.tapalque.eventos.service;

import com.tapalque.eventos.Exceptions.EventoNotFoundException;
import com.tapalque.eventos.dto.EventoRequestDTO;
import com.tapalque.eventos.dto.EventoResponseDTO;
import com.tapalque.eventos.entity.Evento;
import com.tapalque.eventos.repository.EventoRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EventoService Tests")
class EventoServiceTest {

    @Mock
    private EventoRepository eventoRepository;

    @InjectMocks
    private EventoService eventoService;

    private Evento testEvento;
    private EventoRequestDTO testRequestDTO;

    @BeforeEach
    void setUp() {
        testEvento = new Evento();
        testEvento.setId(1L);
        testEvento.setNombreEvento("Festival de Verano");
        testEvento.setLugar("Plaza Principal");
        testEvento.setHorario("20:00 - 00:00");
        testEvento.setFechaInicio(LocalDate.of(2026, 1, 15));
        testEvento.setFechaFin(LocalDate.of(2026, 1, 17));
        testEvento.setTelefonoContacto("+5491234567890");
        testEvento.setNombreContacto("Juan Pérez");
        testEvento.setImagenes(Collections.emptyList());

        testRequestDTO = new EventoRequestDTO();
        testRequestDTO.setNombreEvento("Festival de Verano");
        testRequestDTO.setLugar("Plaza Principal");
        testRequestDTO.setHorario("20:00 - 00:00");
        testRequestDTO.setFechaInicio(LocalDate.of(2026, 1, 15));
        testRequestDTO.setFechaFin(LocalDate.of(2026, 1, 17));
        testRequestDTO.setTelefonoContacto("+5491234567890");
        testRequestDTO.setNombreContacto("Juan Pérez");
    }

    @Nested
    @DisplayName("Tests de crear")
    class CrearTests {

        @Test
        @DisplayName("Debe crear evento con datos válidos")
        void crear_ConDatosValidos_RetornaEventoResponseDTO() {
            // Given
            when(eventoRepository.save(any(Evento.class))).thenAnswer(invocation -> {
                Evento saved = invocation.getArgument(0);
                saved.setId(1L);
                saved.setImagenes(Collections.emptyList());
                return saved;
            });

            // When
            EventoResponseDTO result = eventoService.crear(testRequestDTO);

            // Then
            assertNotNull(result);
            assertEquals("Festival de Verano", result.getNombreEvento());
            verify(eventoRepository).save(any(Evento.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si nombre es null")
        void crear_ConNombreNull_LanzaExcepcion() {
            // Given
            testRequestDTO.setNombreEvento(null);

            // When & Then
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> eventoService.crear(testRequestDTO)
            );
            assertEquals("El nombre del evento es obligatorio", exception.getMessage());
            verify(eventoRepository, never()).save(any(Evento.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si nombre está vacío")
        void crear_ConNombreVacio_LanzaExcepcion() {
            // Given
            testRequestDTO.setNombreEvento("   ");

            // When & Then
            assertThrows(IllegalArgumentException.class, () -> eventoService.crear(testRequestDTO));
            verify(eventoRepository, never()).save(any(Evento.class));
        }
    }

    @Nested
    @DisplayName("Tests de obtenerTodos")
    class ObtenerTodosTests {

        @Test
        @DisplayName("Debe retornar lista de eventos")
        void obtenerTodos_ConEventos_RetornaLista() {
            // Given
            Evento evento2 = new Evento();
            evento2.setId(2L);
            evento2.setNombreEvento("Concierto Rock");
            evento2.setImagenes(Collections.emptyList());

            when(eventoRepository.findAll()).thenReturn(Arrays.asList(testEvento, evento2));

            // When
            List<EventoResponseDTO> result = eventoService.obtenerTodos();

            // Then
            assertNotNull(result);
            assertEquals(2, result.size());
            verify(eventoRepository).findAll();
        }

        @Test
        @DisplayName("Debe retornar lista vacía cuando no hay eventos")
        void obtenerTodos_SinEventos_RetornaListaVacia() {
            // Given
            when(eventoRepository.findAll()).thenReturn(Collections.emptyList());

            // When
            List<EventoResponseDTO> result = eventoService.obtenerTodos();

            // Then
            assertNotNull(result);
            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("Tests de obtenerPorId")
    class ObtenerPorIdTests {

        @Test
        @DisplayName("Debe retornar evento cuando existe")
        void obtenerPorId_ConIdExistente_RetornaEvento() {
            // Given
            when(eventoRepository.findById(1L)).thenReturn(Optional.of(testEvento));

            // When
            EventoResponseDTO result = eventoService.obtenerPorId(1L);

            // Then
            assertNotNull(result);
            assertEquals("Festival de Verano", result.getNombreEvento());
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando no existe")
        void obtenerPorId_ConIdNoExistente_LanzaExcepcion() {
            // Given
            when(eventoRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(EventoNotFoundException.class, () -> eventoService.obtenerPorId(999L));
        }
    }

    @Nested
    @DisplayName("Tests de actualizarCompleto")
    class ActualizarCompletoTests {

        @Test
        @DisplayName("Debe actualizar evento completamente")
        void actualizarCompleto_ConDatosValidos_RetornaEventoActualizado() {
            // Given
            when(eventoRepository.findById(1L)).thenReturn(Optional.of(testEvento));
            when(eventoRepository.save(any(Evento.class))).thenAnswer(invocation -> {
                Evento saved = invocation.getArgument(0);
                saved.setImagenes(Collections.emptyList());
                return saved;
            });

            // When
            EventoResponseDTO result = eventoService.actualizarCompleto(1L, testRequestDTO);

            // Then
            assertNotNull(result);
            assertEquals(1L, result.getId());
            verify(eventoRepository).save(any(Evento.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si evento no existe")
        void actualizarCompleto_ConIdNoExistente_LanzaExcepcion() {
            // Given
            when(eventoRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(EventoNotFoundException.class,
                    () -> eventoService.actualizarCompleto(999L, testRequestDTO));
            verify(eventoRepository, never()).save(any(Evento.class));
        }
    }

    @Nested
    @DisplayName("Tests de actualizarParcial")
    class ActualizarParcialTests {

        @Test
        @DisplayName("Debe actualizar solo campos proporcionados")
        void actualizarParcial_ConCamposParciales_ActualizaSoloCampos() {
            // Given
            EventoRequestDTO partialDto = new EventoRequestDTO();
            partialDto.setNombreEvento("Nuevo Nombre");

            when(eventoRepository.findById(1L)).thenReturn(Optional.of(testEvento));
            when(eventoRepository.save(any(Evento.class))).thenReturn(testEvento);

            // When
            EventoResponseDTO result = eventoService.actualizarParcial(1L, partialDto);

            // Then
            assertNotNull(result);
            verify(eventoRepository).save(testEvento);
        }
    }

    @Nested
    @DisplayName("Tests de eliminar")
    class EliminarTests {

        @Test
        @DisplayName("Debe eliminar evento existente")
        void eliminar_ConIdExistente_EliminaEvento() {
            // Given
            when(eventoRepository.findById(1L)).thenReturn(Optional.of(testEvento));
            doNothing().when(eventoRepository).delete(testEvento);

            // When
            assertDoesNotThrow(() -> eventoService.eliminar(1L));

            // Then
            verify(eventoRepository).delete(testEvento);
        }

        @Test
        @DisplayName("Debe lanzar excepción si evento no existe")
        void eliminar_ConIdNoExistente_LanzaExcepcion() {
            // Given
            when(eventoRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(EventoNotFoundException.class, () -> eventoService.eliminar(999L));
            verify(eventoRepository, never()).delete(any(Evento.class));
        }
    }
}
