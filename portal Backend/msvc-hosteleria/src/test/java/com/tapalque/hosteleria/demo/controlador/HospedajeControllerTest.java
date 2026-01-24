package com.tapalque.hosteleria.demo.controlador;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tapalque.hosteleria.demo.dto.HospedajeDTO;
import com.tapalque.hosteleria.demo.dto.HospedajeRequestDTO;
import com.tapalque.hosteleria.demo.entidades.TipoHospedaje;
import com.tapalque.hosteleria.demo.servicio.HospedajeService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HospedajeController.class)
@DisplayName("HospedajeController Tests")
class HospedajeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private HospedajeService hospedajeService;

    private HospedajeDTO testHospedajeDTO;
    private HospedajeRequestDTO testRequestDTO;

    @BeforeEach
    void setUp() {
        testHospedajeDTO = new HospedajeDTO();
        testHospedajeDTO.setId(1L);
        testHospedajeDTO.setTitulo("Hotel Test");
        testHospedajeDTO.setDescription("Un hotel de prueba");
        testHospedajeDTO.setUbicacion("Calle Principal 123");
        testHospedajeDTO.setGoogleMapsUrl("https://maps.google.com/test");
        testHospedajeDTO.setNumWhatsapp("+5491234567890");
        testHospedajeDTO.setTipoHospedaje("HOTEL");
        testHospedajeDTO.setImagenes(Collections.emptyList());

        testRequestDTO = new HospedajeRequestDTO();
        testRequestDTO.setTitulo("Hotel Test");
        testRequestDTO.setDescription("Un hotel de prueba para testing");
        testRequestDTO.setUbicacion("Calle Principal 123");
        testRequestDTO.setGoogleMapsUrl("https://maps.google.com/test");
        testRequestDTO.setNumWhatsapp("+5491234567890");
        testRequestDTO.setTipoHospedaje(TipoHospedaje.HOTEL);
    }

    @Nested
    @DisplayName("Tests de GET /hospedajes")
    class ListarTests {

        @Test
        @DisplayName("Debe retornar lista de hospedajes")
        void listar_ConHospedajes_RetornaOk() throws Exception {
            // Given
            HospedajeDTO dto2 = new HospedajeDTO();
            dto2.setId(2L);
            dto2.setTitulo("Cabaña Rural");
            dto2.setTipoHospedaje("CABAÑA");
            dto2.setImagenes(Collections.emptyList());

            when(hospedajeService.obtenerTodos())
                    .thenReturn(Arrays.asList(testHospedajeDTO, dto2));

            // When & Then
            mockMvc.perform(get("/hospedajes"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$[0].titulo").value("Hotel Test"))
                    .andExpect(jsonPath("$[1].titulo").value("Cabaña Rural"));

            verify(hospedajeService).obtenerTodos();
        }

        @Test
        @DisplayName("Debe retornar lista vacía")
        void listar_SinHospedajes_RetornaListaVacia() throws Exception {
            // Given
            when(hospedajeService.obtenerTodos()).thenReturn(Collections.emptyList());

            // When & Then
            mockMvc.perform(get("/hospedajes"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$").isEmpty());

            verify(hospedajeService).obtenerTodos();
        }
    }

    @Nested
    @DisplayName("Tests de GET /hospedajes/{id}")
    class ObtenerPorIdTests {

        @Test
        @DisplayName("Debe retornar hospedaje con status 200")
        void obtenerPorId_ConIdExistente_RetornaOk() throws Exception {
            // Given
            when(hospedajeService.obtenerPorId(1L))
                    .thenReturn(ResponseEntity.ok(testHospedajeDTO));

            // When & Then
            mockMvc.perform(get("/hospedajes/1"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.titulo").value("Hotel Test"));

            verify(hospedajeService).obtenerPorId(1L);
        }

        @Test
        @DisplayName("Debe retornar status 404 cuando no existe")
        void obtenerPorId_ConIdNoExistente_RetornaNotFound() throws Exception {
            // Given
            when(hospedajeService.obtenerPorId(999L))
                    .thenReturn(ResponseEntity.notFound().build());

            // When & Then
            mockMvc.perform(get("/hospedajes/999"))
                    .andExpect(status().isNotFound());

            verify(hospedajeService).obtenerPorId(999L);
        }
    }

    @Nested
    @DisplayName("Tests de POST /hospedajes")
    class CrearTests {

        @Test
        @DisplayName("Debe crear hospedaje con status 200")
        void crear_ConDatosValidos_RetornaOk() throws Exception {
            // Given
            when(hospedajeService.guardar(any(HospedajeRequestDTO.class)))
                    .thenReturn(testHospedajeDTO);

            // When & Then
            mockMvc.perform(post("/hospedajes")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRequestDTO)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.titulo").value("Hotel Test"));

            verify(hospedajeService).guardar(any(HospedajeRequestDTO.class));
        }
    }

    @Nested
    @DisplayName("Tests de PUT /hospedajes/{id}")
    class ActualizarTests {

        @Test
        @DisplayName("Debe actualizar hospedaje con status 200")
        void actualizar_ConDatosValidos_RetornaOk() throws Exception {
            // Given
            testHospedajeDTO.setTitulo("Hotel Actualizado");
            when(hospedajeService.actualizarHospedaje(eq(1L), any(HospedajeRequestDTO.class)))
                    .thenReturn(ResponseEntity.ok(testHospedajeDTO));

            // When & Then
            mockMvc.perform(put("/hospedajes/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRequestDTO)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.titulo").value("Hotel Actualizado"));

            verify(hospedajeService).actualizarHospedaje(eq(1L), any(HospedajeRequestDTO.class));
        }

        @Test
        @DisplayName("Debe retornar status 404 cuando hospedaje no existe")
        void actualizar_ConIdNoExistente_RetornaNotFound() throws Exception {
            // Given
            when(hospedajeService.actualizarHospedaje(eq(999L), any(HospedajeRequestDTO.class)))
                    .thenReturn(ResponseEntity.notFound().build());

            // When & Then
            mockMvc.perform(put("/hospedajes/999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRequestDTO)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Tests de DELETE /hospedajes/{id}")
    class EliminarTests {

        @Test
        @DisplayName("Debe eliminar hospedaje con status 204")
        void eliminar_ConIdExistente_RetornaNoContent() throws Exception {
            // Given
            when(hospedajeService.eliminarPorId(1L))
                    .thenReturn(ResponseEntity.noContent().build());

            // When & Then
            mockMvc.perform(delete("/hospedajes/1"))
                    .andExpect(status().isNoContent());

            verify(hospedajeService).eliminarPorId(1L);
        }

        @Test
        @DisplayName("Debe retornar status 404 cuando hospedaje no existe")
        void eliminar_ConIdNoExistente_RetornaNotFound() throws Exception {
            // Given
            when(hospedajeService.eliminarPorId(999L))
                    .thenReturn(ResponseEntity.notFound().build());

            // When & Then
            mockMvc.perform(delete("/hospedajes/999"))
                    .andExpect(status().isNotFound());

            verify(hospedajeService).eliminarPorId(999L);
        }
    }
}
