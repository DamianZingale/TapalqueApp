package com.tapalque.comercio.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.Collections;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tapalque.comercio.Exceptions.ComercioNotFoundException;
import com.tapalque.comercio.dto.ComercioRequestDTO;
import com.tapalque.comercio.dto.ComercioResponseDTO;
import com.tapalque.comercio.service.ComercioService;

@WebMvcTest(ComercioController.class)
@DisplayName("ComercioController Tests")
class ComercioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ComercioService comercioService;

    private ComercioResponseDTO testResponseDTO;
    private ComercioRequestDTO testRequestDTO;

    @BeforeEach
    void setUp() {
        testResponseDTO = new ComercioResponseDTO();
        testResponseDTO.setId(1L);
        testResponseDTO.setTitulo("Tienda Test");
        testResponseDTO.setDescripcion("Una tienda de prueba");
        testResponseDTO.setDireccion("Calle Principal 123");
        testResponseDTO.setHorario("9:00 - 18:00");
        testResponseDTO.setTelefono("123456789");
        testResponseDTO.setLatitud(-36.3629);
        testResponseDTO.setLongitud(-60.0243);
        testResponseDTO.setImagenes(Collections.emptyList());

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
    @DisplayName("Tests de POST /comercio")
    class CrearTests {

        @Test
        @DisplayName("Debe crear comercio con status 201")
        void crear_ConDatosValidos_RetornaCreated() throws Exception {
            // Given
            when(comercioService.crear(any(ComercioRequestDTO.class)))
                    .thenReturn(testResponseDTO);

            // When & Then
            mockMvc.perform(post("/comercio")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRequestDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.titulo").value("Tienda Test"));

            verify(comercioService).crear(any(ComercioRequestDTO.class));
        }

        @Test
        @DisplayName("Debe retornar error cuando título es inválido")
        void crear_ConTituloInvalido_RetornaError() throws Exception {
            // Given
            testRequestDTO.setTitulo(null);
            when(comercioService.crear(any(ComercioRequestDTO.class)))
                    .thenThrow(new IllegalArgumentException("El título del comercio es obligatorio"));

            // When & Then
            mockMvc.perform(post("/comercio")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRequestDTO)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Tests de GET /comercio/list")
    class ListarTests {

        @Test
        @DisplayName("Debe retornar lista de comercios con status 200")
        void listar_ConComercios_RetornaOk() throws Exception {
            // Given
            ComercioResponseDTO dto2 = new ComercioResponseDTO();
            dto2.setId(2L);
            dto2.setTitulo("Otra Tienda");
            dto2.setImagenes(Collections.emptyList());

            when(comercioService.obtenerTodos())
                    .thenReturn(Arrays.asList(testResponseDTO, dto2));

            // When & Then
            mockMvc.perform(get("/comercio/list"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$[0].titulo").value("Tienda Test"))
                    .andExpect(jsonPath("$[1].titulo").value("Otra Tienda"));

            verify(comercioService).obtenerTodos();
        }

        @Test
        @DisplayName("Debe retornar lista vacía con status 200")
        void listar_SinComercios_RetornaListaVacia() throws Exception {
            // Given
            when(comercioService.obtenerTodos()).thenReturn(Collections.emptyList());

            // When & Then
            mockMvc.perform(get("/comercio/list"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$").isEmpty());

            verify(comercioService).obtenerTodos();
        }
    }

    @Nested
    @DisplayName("Tests de GET /comercio/{id}")
    class ObtenerPorIdTests {

        @Test
        @DisplayName("Debe retornar comercio con status 200")
        void obtenerPorId_ConIdExistente_RetornaOk() throws Exception {
            // Given
            when(comercioService.obtenerPorId(1L)).thenReturn(testResponseDTO);

            // When & Then
            mockMvc.perform(get("/comercio/1"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.titulo").value("Tienda Test"));

            verify(comercioService).obtenerPorId(1L);
        }

        @Test
        @DisplayName("Debe retornar status 404 cuando no existe")
        void obtenerPorId_ConIdNoExistente_RetornaNotFound() throws Exception {
            // Given
            when(comercioService.obtenerPorId(999L))
                    .thenThrow(new ComercioNotFoundException(999L));

            // When & Then
            mockMvc.perform(get("/comercio/999"))
                    .andExpect(status().isNotFound());

            verify(comercioService).obtenerPorId(999L);
        }
    }

    @Nested
    @DisplayName("Tests de PUT /comercio/{id}")
    class ActualizarTests {

        @Test
        @DisplayName("Debe actualizar comercio con status 200")
        void actualizar_ConDatosValidos_RetornaOk() throws Exception {
            // Given
            testResponseDTO.setTitulo("Tienda Actualizada");
            when(comercioService.actualizarCompleto(eq(1L), any(ComercioRequestDTO.class)))
                    .thenReturn(testResponseDTO);

            // When & Then
            mockMvc.perform(put("/comercio/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRequestDTO)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.titulo").value("Tienda Actualizada"));

            verify(comercioService).actualizarCompleto(eq(1L), any(ComercioRequestDTO.class));
        }

        @Test
        @DisplayName("Debe retornar status 404 cuando comercio no existe")
        void actualizar_ConIdNoExistente_RetornaNotFound() throws Exception {
            // Given
            when(comercioService.actualizarCompleto(eq(999L), any(ComercioRequestDTO.class)))
                    .thenThrow(new ComercioNotFoundException(999L));

            // When & Then
            mockMvc.perform(put("/comercio/999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRequestDTO)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Tests de PATCH /comercio/patch/{id}")
    class ActualizarParcialTests {

        @Test
        @DisplayName("Debe actualizar parcialmente con status 200")
        void actualizarParcial_ConDatosValidos_RetornaOk() throws Exception {
            // Given
            when(comercioService.actualizarParcial(eq(1L), any(ComercioRequestDTO.class)))
                    .thenReturn(testResponseDTO);

            // When & Then
            mockMvc.perform(patch("/comercio/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRequestDTO)))
                    .andExpect(status().isOk());

            verify(comercioService).actualizarParcial(eq(1L), any(ComercioRequestDTO.class));
        }
    }

    @Nested
    @DisplayName("Tests de DELETE /comercio/{id}")
    class EliminarTests {

        @Test
        @DisplayName("Debe eliminar comercio con status 204")
        void eliminar_ConIdExistente_RetornaNoContent() throws Exception {
            // Given
            doNothing().when(comercioService).eliminar(1L);

            // When & Then
            mockMvc.perform(delete("/comercio/1"))
                    .andExpect(status().isNoContent());

            verify(comercioService).eliminar(1L);
        }

        @Test
        @DisplayName("Debe retornar status 404 cuando comercio no existe")
        void eliminar_ConIdNoExistente_RetornaNotFound() throws Exception {
            // Given
            doThrow(new ComercioNotFoundException(999L))
                    .when(comercioService).eliminar(999L);

            // When & Then
            mockMvc.perform(delete("/comercio/999"))
                    .andExpect(status().isNotFound());

            verify(comercioService).eliminar(999L);
        }
    }
}
