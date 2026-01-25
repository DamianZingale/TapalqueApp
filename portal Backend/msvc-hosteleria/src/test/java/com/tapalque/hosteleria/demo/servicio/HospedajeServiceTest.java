package com.tapalque.hosteleria.demo.servicio;

import com.tapalque.hosteleria.demo.dto.HospedajeDTO;
import com.tapalque.hosteleria.demo.dto.HospedajeRequestDTO;
import com.tapalque.hosteleria.demo.entidades.Hospedaje;
import com.tapalque.hosteleria.demo.entidades.TipoHospedaje;
import com.tapalque.hosteleria.demo.repositorio.HospedajeRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("HospedajeService Tests")
class HospedajeServiceTest {

    @Mock
    private HospedajeRepository hospedajeRepository;

    @InjectMocks
    private HospedajeService hospedajeService;

    private Hospedaje testHospedaje;
    private HospedajeRequestDTO testRequestDTO;

    @BeforeEach
    void setUp() {
        testHospedaje = new Hospedaje();
        testHospedaje.setId(1L);
        testHospedaje.setTitulo("Hotel Test");
        testHospedaje.setDescription("Un hotel de prueba para testing");
        testHospedaje.setUbicacion("Calle Principal 123, Tapalqué");
        testHospedaje.setGoogleMapsUrl("https://maps.google.com/test");
        testHospedaje.setNumWhatsapp("+5491234567890");
        testHospedaje.setTipoHospedaje(TipoHospedaje.HOTEL);
        testHospedaje.setImagenes(new ArrayList<>());

        testRequestDTO = new HospedajeRequestDTO();
        testRequestDTO.setTitulo("Hotel Test");
        testRequestDTO.setDescription("Un hotel de prueba para testing");
        testRequestDTO.setUbicacion("Calle Principal 123, Tapalqué");
        testRequestDTO.setGoogleMapsUrl("https://maps.google.com/test");
        testRequestDTO.setNumWhatsapp("+5491234567890");
        testRequestDTO.setTipoHospedaje(TipoHospedaje.HOTEL);
        testRequestDTO.setImagenes(Collections.emptyList());
    }

    @Nested
    @DisplayName("Tests de obtenerTodos")
    class ObtenerTodosTests {

        @Test
        @DisplayName("Debe retornar lista de hospedajes")
        void obtenerTodos_ConHospedajes_RetornaLista() {
            // Given
            Hospedaje hospedaje2 = new Hospedaje();
            hospedaje2.setId(2L);
            hospedaje2.setTitulo("Cabaña Rural");
            hospedaje2.setTipoHospedaje(TipoHospedaje.CABAÑA);
            hospedaje2.setImagenes(Collections.emptyList());

            when(hospedajeRepository.findAll())
                    .thenReturn(Arrays.asList(testHospedaje, hospedaje2));

            // When
            List<HospedajeDTO> result = hospedajeService.obtenerTodos();

            // Then
            assertNotNull(result);
            assertEquals(2, result.size());
            assertEquals("Hotel Test", result.get(0).getTitulo());
            assertEquals("Cabaña Rural", result.get(1).getTitulo());
            verify(hospedajeRepository).findAll();
        }

        @Test
        @DisplayName("Debe retornar lista vacía cuando no hay hospedajes")
        void obtenerTodos_SinHospedajes_RetornaListaVacia() {
            // Given
            when(hospedajeRepository.findAll()).thenReturn(Collections.emptyList());

            // When
            List<HospedajeDTO> result = hospedajeService.obtenerTodos();

            // Then
            assertNotNull(result);
            assertTrue(result.isEmpty());
            verify(hospedajeRepository).findAll();
        }
    }

    @Nested
    @DisplayName("Tests de obtenerPorId")
    class ObtenerPorIdTests {

        @Test
        @DisplayName("Debe retornar hospedaje cuando existe")
        void obtenerPorId_ConIdExistente_RetornaOk() {
            // Given
            when(hospedajeRepository.findById(1L)).thenReturn(Optional.of(testHospedaje));

            // When
            ResponseEntity<HospedajeDTO> result = hospedajeService.obtenerPorId(1L);

            // Then
            assertEquals(HttpStatus.OK, result.getStatusCode());
            assertNotNull(result.getBody());
            assertEquals("Hotel Test", result.getBody().getTitulo());
            verify(hospedajeRepository).findById(1L);
        }

        @Test
        @DisplayName("Debe retornar 404 cuando no existe")
        void obtenerPorId_ConIdNoExistente_RetornaNotFound() {
            // Given
            when(hospedajeRepository.findById(999L)).thenReturn(Optional.empty());

            // When
            ResponseEntity<HospedajeDTO> result = hospedajeService.obtenerPorId(999L);

            // Then
            assertEquals(HttpStatus.NOT_FOUND, result.getStatusCode());
            assertNull(result.getBody());
            verify(hospedajeRepository).findById(999L);
        }
    }

    @Nested
    @DisplayName("Tests de guardar")
    class GuardarTests {

        @Test
        @DisplayName("Debe guardar hospedaje correctamente")
        void guardar_ConDatosValidos_RetornaHospedajeDTO() {
            // Given
            when(hospedajeRepository.save(any(Hospedaje.class))).thenAnswer(invocation -> {
                Hospedaje saved = invocation.getArgument(0);
                saved.setId(1L);
                return saved;
            });

            // When
            HospedajeDTO result = hospedajeService.guardar(testRequestDTO);

            // Then
            assertNotNull(result);
            assertEquals("Hotel Test", result.getTitulo());
            assertEquals("HOTEL", result.getTipoHospedaje());
            verify(hospedajeRepository).save(any(Hospedaje.class));
        }

        @Test
        @DisplayName("Debe guardar hospedaje con imágenes")
        void guardar_ConImagenes_RetornaHospedajeDTOConImagenes() {
            // Given
            testRequestDTO.setImagenes(Arrays.asList("http://img1.jpg", "http://img2.jpg"));
            when(hospedajeRepository.save(any(Hospedaje.class))).thenAnswer(invocation -> {
                Hospedaje saved = invocation.getArgument(0);
                saved.setId(1L);
                return saved;
            });

            // When
            HospedajeDTO result = hospedajeService.guardar(testRequestDTO);

            // Then
            assertNotNull(result);
            assertNotNull(result.getImagenes());
            assertEquals(2, result.getImagenes().size());
            verify(hospedajeRepository).save(any(Hospedaje.class));
        }
    }

    @Nested
    @DisplayName("Tests de eliminarPorId")
    class EliminarPorIdTests {

        @Test
        @DisplayName("Debe eliminar hospedaje existente")
        void eliminarPorId_ConIdExistente_RetornaNoContent() {
            // Given
            when(hospedajeRepository.findById(1L)).thenReturn(Optional.of(testHospedaje));
            doNothing().when(hospedajeRepository).deleteById(1L);

            // When
            ResponseEntity<Void> result = hospedajeService.eliminarPorId(1L);

            // Then
            assertEquals(HttpStatus.NO_CONTENT, result.getStatusCode());
            verify(hospedajeRepository).findById(1L);
            verify(hospedajeRepository).deleteById(1L);
        }

        @Test
        @DisplayName("Debe retornar 404 si hospedaje no existe")
        void eliminarPorId_ConIdNoExistente_RetornaNotFound() {
            // Given
            when(hospedajeRepository.findById(999L)).thenReturn(Optional.empty());

            // When
            ResponseEntity<Void> result = hospedajeService.eliminarPorId(999L);

            // Then
            assertEquals(HttpStatus.NOT_FOUND, result.getStatusCode());
            verify(hospedajeRepository).findById(999L);
            verify(hospedajeRepository, never()).deleteById(anyLong());
        }
    }

    @Nested
    @DisplayName("Tests de actualizarHospedaje")
    class ActualizarHospedajeTests {

        @Test
        @DisplayName("Debe actualizar hospedaje existente")
        void actualizarHospedaje_ConIdExistente_RetornaOk() {
            // Given
            HospedajeRequestDTO updateDto = new HospedajeRequestDTO();
            updateDto.setTitulo("Hotel Actualizado");
            updateDto.setDescription("Nueva descripción del hotel");
            updateDto.setUbicacion("Nueva Ubicación");
            updateDto.setGoogleMapsUrl("https://maps.google.com/nuevo");
            updateDto.setNumWhatsapp("+5499876543210");
            updateDto.setTipoHospedaje(TipoHospedaje.DEPARTAMENTO);

            when(hospedajeRepository.findById(1L)).thenReturn(Optional.of(testHospedaje));
            when(hospedajeRepository.save(any(Hospedaje.class))).thenReturn(testHospedaje);

            // When
            ResponseEntity<HospedajeDTO> result = hospedajeService.actualizarHospedaje(1L, updateDto);

            // Then
            assertEquals(HttpStatus.OK, result.getStatusCode());
            assertNotNull(result.getBody());
            verify(hospedajeRepository).findById(1L);
            verify(hospedajeRepository).save(any(Hospedaje.class));
        }

        @Test
        @DisplayName("Debe retornar 404 si hospedaje no existe")
        void actualizarHospedaje_ConIdNoExistente_RetornaNotFound() {
            // Given
            when(hospedajeRepository.findById(999L)).thenReturn(Optional.empty());

            // When
            ResponseEntity<HospedajeDTO> result = hospedajeService.actualizarHospedaje(999L, testRequestDTO);

            // Then
            assertEquals(HttpStatus.NOT_FOUND, result.getStatusCode());
            verify(hospedajeRepository).findById(999L);
            verify(hospedajeRepository, never()).save(any(Hospedaje.class));
        }

        @Test
        @DisplayName("Debe actualizar imágenes correctamente")
        void actualizarHospedaje_ConNuevasImagenes_ActualizaImagenes() {
            // Given
            HospedajeRequestDTO updateDto = new HospedajeRequestDTO();
            updateDto.setTitulo("Hotel Test");
            updateDto.setDescription("Descripción actualizada");
            updateDto.setUbicacion("Ubicación");
            updateDto.setGoogleMapsUrl("https://maps.google.com");
            updateDto.setNumWhatsapp("+5491234567890");
            updateDto.setTipoHospedaje(TipoHospedaje.HOTEL);
            updateDto.setImagenes(Arrays.asList("http://nueva-img1.jpg", "http://nueva-img2.jpg"));

            when(hospedajeRepository.findById(1L)).thenReturn(Optional.of(testHospedaje));
            when(hospedajeRepository.save(any(Hospedaje.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // When
            ResponseEntity<HospedajeDTO> result = hospedajeService.actualizarHospedaje(1L, updateDto);

            // Then
            assertEquals(HttpStatus.OK, result.getStatusCode());
            assertNotNull(result.getBody());
            assertEquals(2, result.getBody().getImagenes().size());
        }
    }
}
