package com.tapalque.termas.controller;

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
import com.tapalque.termas.Exceptions.TermaNotFoundException;
import com.tapalque.termas.dto.TermaRequestDTO;
import com.tapalque.termas.dto.TermaResponseDTO;
import com.tapalque.termas.service.TermaService;

@WebMvcTest(TermaController.class)
@DisplayName("TermaController Tests")
class TermaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TermaService termaService;

    private TermaResponseDTO testResponseDTO;
    private TermaRequestDTO testRequestDTO;

    @BeforeEach
    void setUp() {
        testResponseDTO = new TermaResponseDTO();
        testResponseDTO.setId(1L);
        testResponseDTO.setTitulo("Termas del Sol");
        testResponseDTO.setDescription("Complejas termas con piletas");
        testResponseDTO.setDireccion("Ruta 205 Km 5");
        testResponseDTO.setImagenes(Collections.emptyList());

        testRequestDTO = new TermaRequestDTO();
        testRequestDTO.setTitulo("Termas del Sol");
        testRequestDTO.setDescripcion("Complejas termas con piletas");
        testRequestDTO.setDireccion("Ruta 205 Km 5");
        testRequestDTO.setHorario("8:00 - 20:00");
        testRequestDTO.setTelefono("+5491234567890");
    }

    @Nested
    @DisplayName("Tests de POST /terma")
    class CrearTests {

        @Test
        @DisplayName("Debe crear terma con status 201")
        void crear_ConDatosValidos_RetornaCreated() throws Exception {
            // Given
            when(termaService.crear(any(TermaRequestDTO.class))).thenReturn(testResponseDTO);

            // When & Then
            mockMvc.perform(post("/terma")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRequestDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.titulo").value("Termas del Sol"));

            verify(termaService).crear(any(TermaRequestDTO.class));
        }
    }

    @Nested
    @DisplayName("Tests de GET /terma")
    class ListarTests {

        @Test
        @DisplayName("Debe retornar lista de termas con status 200")
        void listar_ConTermas_RetornaOk() throws Exception {
            // Given
            TermaResponseDTO dto2 = new TermaResponseDTO();
            dto2.setId(2L);
            dto2.setTitulo("Termas Naturales");
            dto2.setImagenes(Collections.emptyList());

            when(termaService.obtenerTodos()).thenReturn(Arrays.asList(testResponseDTO, dto2));

            // When & Then
            mockMvc.perform(get("/terma"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].titulo").value("Termas del Sol"))
                    .andExpect(jsonPath("$[1].titulo").value("Termas Naturales"));
        }
    }

    @Nested
    @DisplayName("Tests de GET /terma/{id}")
    class ObtenerPorIdTests {

        @Test
        @DisplayName("Debe retornar terma con status 200")
        void obtenerPorId_ConIdExistente_RetornaOk() throws Exception {
            // Given
            when(termaService.obtenerPorId(1L)).thenReturn(testResponseDTO);

            // When & Then
            mockMvc.perform(get("/terma/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.titulo").value("Termas del Sol"));
        }

        @Test
        @DisplayName("Debe retornar status 404 cuando no existe")
        void obtenerPorId_ConIdNoExistente_RetornaNotFound() throws Exception {
            // Given
            when(termaService.obtenerPorId(999L)).thenThrow(new TermaNotFoundException(999L));

            // When & Then
            mockMvc.perform(get("/terma/999"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Tests de PUT /terma/{id}")
    class ActualizarTests {

        @Test
        @DisplayName("Debe actualizar terma con status 200")
        void actualizar_ConDatosValidos_RetornaOk() throws Exception {
            // Given
            when(termaService.actualizarCompleto(eq(1L), any(TermaRequestDTO.class)))
                    .thenReturn(testResponseDTO);

            // When & Then
            mockMvc.perform(put("/terma/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRequestDTO)))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Tests de DELETE /terma/{id}")
    class EliminarTests {

        @Test
        @DisplayName("Debe eliminar terma con status 204")
        void eliminar_ConIdExistente_RetornaNoContent() throws Exception {
            // Given
            doNothing().when(termaService).eliminar(1L);

            // When & Then
            mockMvc.perform(delete("/terma/1"))
                    .andExpect(status().isNoContent());

            verify(termaService).eliminar(1L);
        }

        @Test
        @DisplayName("Debe retornar status 404 cuando terma no existe")
        void eliminar_ConIdNoExistente_RetornaNotFound() throws Exception {
            // Given
            doThrow(new TermaNotFoundException(999L)).when(termaService).eliminar(999L);

            // When & Then
            mockMvc.perform(delete("/terma/999"))
                    .andExpect(status().isNotFound());
        }
    }
}
