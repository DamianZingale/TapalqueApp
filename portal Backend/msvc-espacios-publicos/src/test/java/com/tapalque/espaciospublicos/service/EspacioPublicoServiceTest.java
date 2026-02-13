package com.tapalque.espaciospublicos.service;

import com.tapalque.espaciospublicos.Exceptions.EspacioPublicoNotFoundException;
import com.tapalque.espaciospublicos.dto.EspacioPublicoRequestDTO;
import com.tapalque.espaciospublicos.dto.EspacioPublicoResponseDTO;
import com.tapalque.espaciospublicos.entity.EspacioPublico;
import com.tapalque.espaciospublicos.repository.EspacioPublicoRepository;

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
@DisplayName("EspacioPublicoService Tests")
class EspacioPublicoServiceTest {

    @Mock
    private EspacioPublicoRepository espacioPublicoRepository;

    @InjectMocks
    private EspacioPublicoService espacioPublicoService;

    private EspacioPublico testEspacioPublico;
    private EspacioPublicoRequestDTO testRequestDTO;

    @BeforeEach
    void setUp() {
        testEspacioPublico = new EspacioPublico();
        testEspacioPublico.setId(1L);
        testEspacioPublico.setTitulo("Plaza Principal");
        testEspacioPublico.setDescripcion("Plaza central de la ciudad");
        testEspacioPublico.setDireccion("Centro");
        testEspacioPublico.setCategoria("PLAZA");
        testEspacioPublico.setLatitud(-36.3629);
        testEspacioPublico.setLongitud(-60.0243);
        testEspacioPublico.setImagenes(Collections.emptyList());

        testRequestDTO = new EspacioPublicoRequestDTO();
        testRequestDTO.setTitulo("Plaza Principal");
        testRequestDTO.setDescripcion("Plaza central de la ciudad");
        testRequestDTO.setDireccion("Centro");
        testRequestDTO.setCategoria("PLAZA");
        testRequestDTO.setLatitud(-36.3629);
        testRequestDTO.setLongitud(-60.0243);
    }

    @Nested
    @DisplayName("Tests de crear")
    class CrearTests {

        @Test
        @DisplayName("Debe crear espacio público con datos válidos")
        void crear_ConDatosValidos_RetornaEspacioPublicoResponseDTO() {
            // Given
            when(espacioPublicoRepository.save(any(EspacioPublico.class))).thenAnswer(invocation -> {
                EspacioPublico saved = invocation.getArgument(0);
                saved.setId(1L);
                saved.setImagenes(Collections.emptyList());
                return saved;
            });

            // When
            EspacioPublicoResponseDTO result = espacioPublicoService.crear(testRequestDTO);

            // Then
            assertNotNull(result);
            assertEquals("Plaza Principal", result.getTitulo());
            verify(espacioPublicoRepository).save(any(EspacioPublico.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si título es null")
        void crear_ConTituloNull_LanzaExcepcion() {
            // Given
            testRequestDTO.setTitulo(null);

            // When & Then
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> espacioPublicoService.crear(testRequestDTO)
            );
            assertEquals("El título del espacio público es obligatorio", exception.getMessage());
            verify(espacioPublicoRepository, never()).save(any(EspacioPublico.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si título está vacío")
        void crear_ConTituloVacio_LanzaExcepcion() {
            // Given
            testRequestDTO.setTitulo("   ");

            // When & Then
            assertThrows(IllegalArgumentException.class, () -> espacioPublicoService.crear(testRequestDTO));
            verify(espacioPublicoRepository, never()).save(any(EspacioPublico.class));
        }
    }

    @Nested
    @DisplayName("Tests de obtenerTodos")
    class ObtenerTodosTests {

        @Test
        @DisplayName("Debe retornar lista de espacios públicos")
        void obtenerTodos_ConEspacios_RetornaLista() {
            // Given
            EspacioPublico espacio2 = new EspacioPublico();
            espacio2.setId(2L);
            espacio2.setTitulo("Parque Norte");
            espacio2.setImagenes(Collections.emptyList());

            when(espacioPublicoRepository.findAll()).thenReturn(Arrays.asList(testEspacioPublico, espacio2));

            // When
            List<EspacioPublicoResponseDTO> result = espacioPublicoService.obtenerTodos();

            // Then
            assertNotNull(result);
            assertEquals(2, result.size());
            verify(espacioPublicoRepository).findAll();
        }

        @Test
        @DisplayName("Debe retornar lista vacía cuando no hay espacios")
        void obtenerTodos_SinEspacios_RetornaListaVacia() {
            // Given
            when(espacioPublicoRepository.findAll()).thenReturn(Collections.emptyList());

            // When
            List<EspacioPublicoResponseDTO> result = espacioPublicoService.obtenerTodos();

            // Then
            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("Tests de obtenerPorCategoria")
    class ObtenerPorCategoriaTests {

        @Test
        @DisplayName("Debe retornar espacios filtrados por categoría")
        void obtenerPorCategoria_ConCategoriaExistente_RetornaLista() {
            // Given
            when(espacioPublicoRepository.findByCategoria("PLAZA"))
                    .thenReturn(Arrays.asList(testEspacioPublico));

            // When
            List<EspacioPublicoResponseDTO> result = espacioPublicoService.obtenerPorCategoria("PLAZA");

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals("Plaza Principal", result.get(0).getTitulo());
            verify(espacioPublicoRepository).findByCategoria("PLAZA");
        }
    }

    @Nested
    @DisplayName("Tests de obtenerPorId")
    class ObtenerPorIdTests {

        @Test
        @DisplayName("Debe retornar espacio cuando existe")
        void obtenerPorId_ConIdExistente_RetornaEspacio() {
            // Given
            when(espacioPublicoRepository.findById(1L)).thenReturn(Optional.of(testEspacioPublico));

            // When
            EspacioPublicoResponseDTO result = espacioPublicoService.obtenerPorId(1L);

            // Then
            assertNotNull(result);
            assertEquals("Plaza Principal", result.getTitulo());
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando no existe")
        void obtenerPorId_ConIdNoExistente_LanzaExcepcion() {
            // Given
            when(espacioPublicoRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(EspacioPublicoNotFoundException.class, () -> espacioPublicoService.obtenerPorId(999L));
        }
    }

    @Nested
    @DisplayName("Tests de actualizarCompleto")
    class ActualizarCompletoTests {

        @Test
        @DisplayName("Debe actualizar espacio completamente")
        void actualizarCompleto_ConDatosValidos_RetornaEspacioActualizado() {
            // Given
            when(espacioPublicoRepository.findById(1L)).thenReturn(Optional.of(testEspacioPublico));
            when(espacioPublicoRepository.save(any(EspacioPublico.class))).thenAnswer(invocation -> {
                EspacioPublico saved = invocation.getArgument(0);
                saved.setImagenes(Collections.emptyList());
                return saved;
            });

            // When
            EspacioPublicoResponseDTO result = espacioPublicoService.actualizarCompleto(1L, testRequestDTO);

            // Then
            assertNotNull(result);
            verify(espacioPublicoRepository).save(any(EspacioPublico.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si espacio no existe")
        void actualizarCompleto_ConIdNoExistente_LanzaExcepcion() {
            // Given
            when(espacioPublicoRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(EspacioPublicoNotFoundException.class,
                    () -> espacioPublicoService.actualizarCompleto(999L, testRequestDTO));
        }
    }

    @Nested
    @DisplayName("Tests de eliminar")
    class EliminarTests {

        @Test
        @DisplayName("Debe eliminar espacio existente")
        void eliminar_ConIdExistente_EliminaEspacio() {
            // Given
            when(espacioPublicoRepository.findById(1L)).thenReturn(Optional.of(testEspacioPublico));
            doNothing().when(espacioPublicoRepository).delete(testEspacioPublico);

            // When
            assertDoesNotThrow(() -> espacioPublicoService.eliminar(1L));

            // Then
            verify(espacioPublicoRepository).delete(testEspacioPublico);
        }

        @Test
        @DisplayName("Debe lanzar excepción si espacio no existe")
        void eliminar_ConIdNoExistente_LanzaExcepcion() {
            // Given
            when(espacioPublicoRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(EspacioPublicoNotFoundException.class, () -> espacioPublicoService.eliminar(999L));
        }
    }
}
