package com.tapalque.comercio.service;

import com.tapalque.comercio.Exceptions.ComercioNotFoundException;
import com.tapalque.comercio.dto.ComercioRequestDTO;
import com.tapalque.comercio.dto.ComercioResponseDTO;
import com.tapalque.comercio.entity.Comercio;
import com.tapalque.comercio.repository.ComercioRepository;

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
@DisplayName("ComercioService Tests")
class ComercioServiceTest {

    @Mock
    private ComercioRepository comercioRepository;

    @InjectMocks
    private ComercioService comercioService;

    private Comercio testComercio;
    private ComercioRequestDTO testRequestDTO;

    @BeforeEach
    void setUp() {
        testComercio = new Comercio();
        testComercio.setId(1L);
        testComercio.setTitulo("Tienda Test");
        testComercio.setDescripcion("Una tienda de prueba");
        testComercio.setDireccion("Calle Principal 123");
        testComercio.setHorario("9:00 - 18:00");
        testComercio.setTelefono("123456789");
        testComercio.setLatitud(-36.3629);
        testComercio.setLongitud(-60.0243);
        testComercio.setFacebook("tiendatest");
        testComercio.setInstagram("@tiendatest");
        testComercio.setImagenes(Collections.emptyList());

        testRequestDTO = new ComercioRequestDTO();
        testRequestDTO.setTitulo("Tienda Test");
        testRequestDTO.setDescripcion("Una tienda de prueba");
        testRequestDTO.setDireccion("Calle Principal 123");
        testRequestDTO.setHorario("9:00 - 18:00");
        testRequestDTO.setTelefono("123456789");
        testRequestDTO.setLatitud(-36.3629);
        testRequestDTO.setLongitud(-60.0243);
    }

    @Nested
    @DisplayName("Tests de crear")
    class CrearTests {

        @Test
        @DisplayName("Debe crear comercio con datos válidos")
        void crear_ConDatosValidos_RetornaComercioResponseDTO() {
            // Given
            when(comercioRepository.save(any(Comercio.class))).thenAnswer(invocation -> {
                Comercio saved = invocation.getArgument(0);
                saved.setId(1L);
                saved.setImagenes(Collections.emptyList());
                return saved;
            });

            // When
            ComercioResponseDTO result = comercioService.crear(testRequestDTO);

            // Then
            assertNotNull(result);
            assertEquals("Tienda Test", result.getTitulo());
            verify(comercioRepository).save(any(Comercio.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si título es null")
        void crear_ConTituloNull_LanzaExcepcion() {
            // Given
            testRequestDTO.setTitulo(null);

            // When & Then
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> comercioService.crear(testRequestDTO)
            );
            assertEquals("El título del comercio es obligatorio", exception.getMessage());
            verify(comercioRepository, never()).save(any(Comercio.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si título está vacío")
        void crear_ConTituloVacio_LanzaExcepcion() {
            // Given
            testRequestDTO.setTitulo("   ");

            // When & Then
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> comercioService.crear(testRequestDTO)
            );
            assertEquals("El título del comercio es obligatorio", exception.getMessage());
            verify(comercioRepository, never()).save(any(Comercio.class));
        }
    }

    @Nested
    @DisplayName("Tests de obtenerTodos")
    class ObtenerTodosTests {

        @Test
        @DisplayName("Debe retornar lista de comercios")
        void obtenerTodos_ConComercios_RetornaLista() {
            // Given
            Comercio comercio2 = new Comercio();
            comercio2.setId(2L);
            comercio2.setTitulo("Otra Tienda");
            comercio2.setImagenes(Collections.emptyList());

            when(comercioRepository.findAll())
                    .thenReturn(Arrays.asList(testComercio, comercio2));

            // When
            List<ComercioResponseDTO> result = comercioService.obtenerTodos();

            // Then
            assertNotNull(result);
            assertEquals(2, result.size());
            assertEquals("Tienda Test", result.get(0).getTitulo());
            assertEquals("Otra Tienda", result.get(1).getTitulo());
            verify(comercioRepository).findAll();
        }

        @Test
        @DisplayName("Debe retornar lista vacía cuando no hay comercios")
        void obtenerTodos_SinComercios_RetornaListaVacia() {
            // Given
            when(comercioRepository.findAll()).thenReturn(Collections.emptyList());

            // When
            List<ComercioResponseDTO> result = comercioService.obtenerTodos();

            // Then
            assertNotNull(result);
            assertTrue(result.isEmpty());
            verify(comercioRepository).findAll();
        }
    }

    @Nested
    @DisplayName("Tests de obtenerPorId")
    class ObtenerPorIdTests {

        @Test
        @DisplayName("Debe retornar comercio cuando existe")
        void obtenerPorId_ConIdExistente_RetornaComercio() {
            // Given
            when(comercioRepository.findById(1L)).thenReturn(Optional.of(testComercio));

            // When
            ComercioResponseDTO result = comercioService.obtenerPorId(1L);

            // Then
            assertNotNull(result);
            assertEquals(1L, result.getId());
            assertEquals("Tienda Test", result.getTitulo());
            verify(comercioRepository).findById(1L);
        }

        @Test
        @DisplayName("Debe lanzar excepción cuando no existe")
        void obtenerPorId_ConIdNoExistente_LanzaExcepcion() {
            // Given
            when(comercioRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(
                    ComercioNotFoundException.class,
                    () -> comercioService.obtenerPorId(999L)
            );
            verify(comercioRepository).findById(999L);
        }
    }

    @Nested
    @DisplayName("Tests de actualizarCompleto")
    class ActualizarCompletoTests {

        @Test
        @DisplayName("Debe actualizar comercio completamente")
        void actualizarCompleto_ConDatosValidos_RetornaComercioActualizado() {
            // Given
            ComercioRequestDTO updateDto = new ComercioRequestDTO();
            updateDto.setTitulo("Tienda Actualizada");
            updateDto.setDescripcion("Nueva descripción");
            updateDto.setDireccion("Nueva Dirección 456");

            when(comercioRepository.findById(1L)).thenReturn(Optional.of(testComercio));
            when(comercioRepository.save(any(Comercio.class))).thenAnswer(invocation -> {
                Comercio saved = invocation.getArgument(0);
                saved.setImagenes(Collections.emptyList());
                return saved;
            });

            // When
            ComercioResponseDTO result = comercioService.actualizarCompleto(1L, updateDto);

            // Then
            assertNotNull(result);
            assertEquals("Tienda Actualizada", result.getTitulo());
            assertEquals(1L, result.getId());
            verify(comercioRepository).findById(1L);
            verify(comercioRepository).save(any(Comercio.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si comercio no existe")
        void actualizarCompleto_ConIdNoExistente_LanzaExcepcion() {
            // Given
            when(comercioRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(
                    ComercioNotFoundException.class,
                    () -> comercioService.actualizarCompleto(999L, testRequestDTO)
            );
            verify(comercioRepository, never()).save(any(Comercio.class));
        }
    }

    @Nested
    @DisplayName("Tests de actualizarParcial")
    class ActualizarParcialTests {

        @Test
        @DisplayName("Debe actualizar solo campos proporcionados")
        void actualizarParcial_ConCamposParciales_ActualizaSoloCamposProporcionados() {
            // Given
            ComercioRequestDTO partialDto = new ComercioRequestDTO();
            partialDto.setTitulo("Nuevo Título");
            // Otros campos son null

            when(comercioRepository.findById(1L)).thenReturn(Optional.of(testComercio));
            when(comercioRepository.save(any(Comercio.class))).thenReturn(testComercio);

            // When
            ComercioResponseDTO result = comercioService.actualizarParcial(1L, partialDto);

            // Then
            assertNotNull(result);
            verify(comercioRepository).findById(1L);
            verify(comercioRepository).save(testComercio);
        }

        @Test
        @DisplayName("Debe lanzar excepción si comercio no existe")
        void actualizarParcial_ConIdNoExistente_LanzaExcepcion() {
            // Given
            when(comercioRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(
                    ComercioNotFoundException.class,
                    () -> comercioService.actualizarParcial(999L, testRequestDTO)
            );
            verify(comercioRepository, never()).save(any(Comercio.class));
        }
    }

    @Nested
    @DisplayName("Tests de eliminar")
    class EliminarTests {

        @Test
        @DisplayName("Debe eliminar comercio existente")
        void eliminar_ConIdExistente_EliminaComercio() {
            // Given
            when(comercioRepository.findById(1L)).thenReturn(Optional.of(testComercio));
            doNothing().when(comercioRepository).delete(testComercio);

            // When
            assertDoesNotThrow(() -> comercioService.eliminar(1L));

            // Then
            verify(comercioRepository).findById(1L);
            verify(comercioRepository).delete(testComercio);
        }

        @Test
        @DisplayName("Debe lanzar excepción si comercio no existe")
        void eliminar_ConIdNoExistente_LanzaExcepcion() {
            // Given
            when(comercioRepository.findById(999L)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(
                    ComercioNotFoundException.class,
                    () -> comercioService.eliminar(999L)
            );
            verify(comercioRepository, never()).delete(any(Comercio.class));
        }
    }
}
