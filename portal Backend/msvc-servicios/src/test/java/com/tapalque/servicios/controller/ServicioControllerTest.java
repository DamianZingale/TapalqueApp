package com.tapalque.servicios.controller;

import java.util.Arrays;
import java.util.Collections;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tapalque.servicios.Exceptions.ServicioNotFoundException;
import com.tapalque.servicios.dto.ServicioRequestDTO;
import com.tapalque.servicios.dto.ServicioResponseDTO;
import com.tapalque.servicios.service.ServicioService;

@WebMvcTest(ServicioController.class)
@DisplayName("ServicioController Tests")
class ServicioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ServicioService servicioService;

    private ServicioResponseDTO testResponseDTO;
    private ServicioRequestDTO testRequestDTO;

    @BeforeEach
    void setUp() {
        testResponseDTO = new ServicioResponseDTO();
        testResponseDTO.setId(1L);
        testResponseDTO.setTitulo("Servicio de Plomería");
        testResponseDTO.setDescription("Servicio profesional");
        testResponseDTO.setDireccion("Calle 123");
        testResponseDTO.setImagenes(Collections.emptyList());

        testRequestDTO = new ServicioRequestDTO();
        testRequestDTO.setTitulo("Servicio de Plomería");
        testRequestDTO.setDescripcion("Servicio profesional");
        testRequestDTO.setDireccion("Calle 123");
        testRequestDTO.setHorario("8:00 - 18:00");
        testRequestDTO.setTelefono("+5491234567890");
    }

    @Nested
    @DisplayName("Tests de POST /api/servicio")
    class CrearTests {

        @Test
        @DisplayName("Debe crear servicio con status 201")
        void crear_ConDatosValidos_RetornaCreated() throws Exception {
            // Given
            when(servicioService.crear(any(ServicioRequestDTO.class))).thenReturn(testResponseDTO);

            // When & Then
            mockMvc.perform(post("/api/servicio")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRequestDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.titulo").value("Servicio de Plomería"));

            verify(servicioService).crear(any(ServicioRequestDTO.class));
        }
    }

    @Nested
    @DisplayName("Tests de GET /api/servicio")
    class ListarTests {

        @Test
        @DisplayName("Debe retornar lista de servicios con status 200")
        void listar_ConServicios_RetornaOk() throws Exception {
            // Given
            ServicioResponseDTO dto2 = new ServicioResponseDTO();
            dto2.setId(2L);
            dto2.setTitulo("Electricista");
            dto2.setImagenes(Collections.emptyList());

            when(servicioService.obtenerTodos()).thenReturn(Arrays.asList(testResponseDTO, dto2));

            // When & Then
            mockMvc.perform(get("/api/servicio"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].titulo").value("Servicio de Plomería"))
                    .andExpect(jsonPath("$[1].titulo").value("Electricista"));
        }
    }

    @Nested
    @DisplayName("Tests de GET /api/servicio/{id}")
    class ObtenerPorIdTests {

        @Test
        @DisplayName("Debe retornar servicio con status 200")
        void obtenerPorId_ConIdExistente_RetornaOk() throws Exception {
            // Given
            when(servicioService.obtenerPorId(1L)).thenReturn(testResponseDTO);

            // When & Then
            mockMvc.perform(get("/api/servicio/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.titulo").value("Servicio de Plomería"));
        }

        @Test
        @DisplayName("Debe retornar status 404 cuando no existe")
        void obtenerPorId_ConIdNoExistente_RetornaNotFound() throws Exception {
            // Given
            when(servicioService.obtenerPorId(999L)).thenThrow(new ServicioNotFoundException(999L));

            // When & Then
            mockMvc.perform(get("/api/servicio/999"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Tests de PUT /api/servicio/{id}")
    class ActualizarTests {

        @Test
        @DisplayName("Debe actualizar servicio con status 200")
        void actualizar_ConDatosValidos_RetornaOk() throws Exception {
            // Given
            when(servicioService.actualizarCompleto(eq(1L), any(ServicioRequestDTO.class)))
                    .thenReturn(testResponseDTO);

            // When & Then
            mockMvc.perform(put("/api/servicio/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRequestDTO)))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Tests de DELETE /api/servicio/{id}")
    class EliminarTests {

        @Test
        @DisplayName("Debe eliminar servicio con status 204")
        void eliminar_ConIdExistente_RetornaNoContent() throws Exception {
            // Given
            doNothing().when(servicioService).eliminar(1L);

            // When & Then
            mockMvc.perform(delete("/api/servicio/1"))
                    .andExpect(status().isNoContent());

            verify(servicioService).eliminar(1L);
        }

        @Test
        @DisplayName("Debe retornar status 404 cuando servicio no existe")
        void eliminar_ConIdNoExistente_RetornaNotFound() throws Exception {
            // Given
            doThrow(new ServicioNotFoundException(999L)).when(servicioService).eliminar(999L);

            // When & Then
            mockMvc.perform(delete("/api/servicio/999"))
                    .andExpect(status().isNotFound());
        }
    }
}
