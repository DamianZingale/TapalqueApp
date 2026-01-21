package com.tapalque.termas.service;

import com.tapalque.termas.Exceptions.TermaNotFoundException;
import com.tapalque.termas.dto.TermaRequestDTO;
import com.tapalque.termas.dto.TermaResponseDTO;
import com.tapalque.termas.entity.Terma;
import com.tapalque.termas.repository.TermaRepository;

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
@DisplayName("TermaService Tests")
class TermaServiceTest {

    @Mock
    private TermaRepository termaRepository;

    @InjectMocks
    private TermaService termaService;

    private Terma testTerma;
    private TermaRequestDTO testRequestDTO;

    @BeforeEach
    void setUp() {
        testTerma = new Terma();
        testTerma.setId(1L);
        testTerma.setTitulo("Termas del Sol");
        testTerma.setDescripcion("Complejas termas con piletas");
        testTerma.setDireccion("Ruta 205 Km 5");
        testTerma.setHorario("8:00 - 20:00");
        testTerma.setTelefono("+5491234567890");
        testTerma.setLatitud(-36.3629);
        testTerma.setLongitud(-60.0243);
        testTerma.setImagenes(Collections.emptyList());

        testRequestDTO = new TermaRequestDTO();
        testRequestDTO.setTitulo("Termas del Sol");
        testRequestDTO.setDescripcion("Complejas termas con piletas");
        testRequestDTO.setDireccion("Ruta 205 Km 5");
        testRequestDTO.setHorario("8:00 - 20:00");
        testRequestDTO.setTelefono("+5491234567890");
        testRequestDTO.setLatitud(-36.3629);
        testRequestDTO.setLongitud(-60.0243);
    }

    @Nested
    @DisplayName("Tests de crear")
    class CrearTests {

        @Test
        @DisplayName("Debe crear terma con datos válidos")
        void crear_ConDatosValidos_RetornaTermaResponseDTO() {
            // Given
            when(termaRepository.save(any(Terma.class))).thenAnswer(invocation -> {
                Terma saved = invocation.getArgument(0);
                saved.setId(1L);
                saved.setImagenes(Collections.emptyList());
                return saved;
            });

            // When
            TermaResponseDTO result = termaService.crear(testRequestDTO);

            // Then
            assertNotNull(result);
            assertEquals("Termas del Sol", result.getTitulo());
            verify(termaRepository).save(any(Terma.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si título es null")
        void crear_ConTituloNull_LanzaExcepcion() {
            // Given
            testRequestDTO.setTitulo(null);

            // When & Then
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> termaService.crear(testRequestDTO)
            );
            assertEquals("El título del terma es obligatorio", exception.getMessage());
            verify(termaRepository, never()).save(any(Terma.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si título está vacío")
        void crear_ConTituloVacio_LanzaExcepcion() {
            // Given
            testRequestDTO.setTitulo("   ");

            // When & Then
            assertThrows(IllegalArgumentException.class, () -> termaService.crear(testRequestDTO));
            verify(termaRepository, never()).save(any(Terma.class));
        }
    }

    @Nested
    @DisplayName("Tests de obtenerTodos")
    class ObtenerTodosTests {

        @Test
        @DisplayName("Debe retornar lista de termas")
        void obtenerTodos_ConTermas_RetornaLista() {
            // Given
            Terma terma2 = new Terma();
            terma2.setId(2L);
            terma2.setTitulo("Termas Naturales");
            terma2.setImagenes(Collections.emptyList());

            when(termaRepository.findAll()).thenReturn(Arrays.asList(testTerma, terma2));

            // When
            List<TermaResponseDTO> result = termaService.obtenerTodos();

            // Then
            assertNotNull(result);
            assertEquals(2, result.size());
            verify(termaRepository).findAll();
        }

        @Test
        @DisplayName("Debe retornar lista vacía cuando no hay termas")
        void obtenerTodos_SinTermas_RetornaListaVacia() {
            // Given
            when(termaRepository.findAll()).thenReturn(Collections.emptyList());

            // When
            List<TermaResponseDTO> result = termaService.obtenerTodos();

            // Then
            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("Tests de obtenerPorId")
    class ObtenerPorIdTests {

        @Test
        @DisplayName("Debe retornar terma cuando existe")
        void obtenerPorId_ConIdExistente_RetornaTerma() {
            // Given
            when(termaRepository.findById(1L)).thenReturn(Optional.of(testTerma));

            // When
            TermaResponseDTO result = termaService.obtenerPorId(1L);

            // Then
            assertNotNull(result);
            assertEquals("Termas del Sol", result.getTitulo());
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando no existe")
        void obtenerPorId_ConIdNoExistente_LanzaExcepcion() {
            // Given
            when(termaRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(TermaNotFoundException.class, () -> termaService.obtenerPorId(999L));
        }
    }

    @Nested
    @DisplayName("Tests de actualizarCompleto")
    class ActualizarCompletoTests {

        @Test
        @DisplayName("Debe actualizar terma completamente")
        void actualizarCompleto_ConDatosValidos_RetornaTermaActualizado() {
            // Given
            when(termaRepository.findById(1L)).thenReturn(Optional.of(testTerma));
            when(termaRepository.save(any(Terma.class))).thenAnswer(invocation -> {
                Terma saved = invocation.getArgument(0);
                saved.setImagenes(Collections.emptyList());
                return saved;
            });

            // When
            TermaResponseDTO result = termaService.actualizarCompleto(1L, testRequestDTO);

            // Then
            assertNotNull(result);
            verify(termaRepository).save(any(Terma.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si terma no existe")
        void actualizarCompleto_ConIdNoExistente_LanzaExcepcion() {
            // Given
            when(termaRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(TermaNotFoundException.class,
                    () -> termaService.actualizarCompleto(999L, testRequestDTO));
        }
    }

    @Nested
    @DisplayName("Tests de eliminar")
    class EliminarTests {

        @Test
        @DisplayName("Debe eliminar terma existente")
        void eliminar_ConIdExistente_EliminaTerma() {
            // Given
            when(termaRepository.findById(1L)).thenReturn(Optional.of(testTerma));
            doNothing().when(termaRepository).delete(testTerma);

            // When
            assertDoesNotThrow(() -> termaService.eliminar(1L));

            // Then
            verify(termaRepository).delete(testTerma);
        }

        @Test
        @DisplayName("Debe lanzar excepción si terma no existe")
        void eliminar_ConIdNoExistente_LanzaExcepcion() {
            // Given
            when(termaRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(TermaNotFoundException.class, () -> termaService.eliminar(999L));
        }
    }
}
