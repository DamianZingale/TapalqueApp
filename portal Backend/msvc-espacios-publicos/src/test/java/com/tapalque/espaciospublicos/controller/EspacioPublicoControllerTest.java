package com.tapalque.espaciospublicos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tapalque.espaciospublicos.Exceptions.EspacioPublicoNotFoundException;
import com.tapalque.espaciospublicos.dto.EspacioPublicoRequestDTO;
import com.tapalque.espaciospublicos.dto.EspacioPublicoResponseDTO;
import com.tapalque.espaciospublicos.service.EspacioPublicoService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EspacioPublicoController.class)
@DisplayName("EspacioPublicoController Tests")
class EspacioPublicoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EspacioPublicoService espacioPublicoService;

    private EspacioPublicoResponseDTO testResponseDTO;
    private EspacioPublicoRequestDTO testRequestDTO;

    @BeforeEach
    void setUp() {
        testResponseDTO = new EspacioPublicoResponseDTO();
        testResponseDTO.setId(1L);
        testResponseDTO.setTitulo("Plaza Principal");
        testResponseDTO.setDescripcion("Plaza central");
        testResponseDTO.setDireccion("Centro");
        testResponseDTO.setCategoria("PLAZA");
        testResponseDTO.setImagenes(Collections.emptyList());

        testRequestDTO = new EspacioPublicoRequestDTO();
        testRequestDTO.setTitulo("Plaza Principal");
        testRequestDTO.setDescripcion("Plaza central");
        testRequestDTO.setDireccion("Centro");
        testRequestDTO.setCategoria("PLAZA");
    }

    @Nested
    @DisplayName("Tests de POST /api/espacio-publico")
    class CrearTests {

        @Test
        @DisplayName("Debe crear espacio con status 201")
        void crear_ConDatosValidos_RetornaCreated() throws Exception {
            // Given
            when(espacioPublicoService.crear(any(EspacioPublicoRequestDTO.class))).thenReturn(testResponseDTO);

            // When & Then
            mockMvc.perform(post("/api/espacio-publico")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRequestDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.titulo").value("Plaza Principal"));

            verify(espacioPublicoService).crear(any(EspacioPublicoRequestDTO.class));
        }
    }

    @Nested
    @DisplayName("Tests de GET /api/espacio-publico")
    class ListarTests {

        @Test
        @DisplayName("Debe retornar lista de espacios con status 200")
        void listar_ConEspacios_RetornaOk() throws Exception {
            // Given
            EspacioPublicoResponseDTO dto2 = new EspacioPublicoResponseDTO();
            dto2.setId(2L);
            dto2.setTitulo("Parque Norte");
            dto2.setImagenes(Collections.emptyList());

            when(espacioPublicoService.obtenerTodos()).thenReturn(Arrays.asList(testResponseDTO, dto2));

            // When & Then
            mockMvc.perform(get("/api/espacio-publico"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].titulo").value("Plaza Principal"))
                    .andExpect(jsonPath("$[1].titulo").value("Parque Norte"));
        }

        @Test
        @DisplayName("Debe filtrar por categoría")
        void listar_ConCategoria_RetornaFiltrado() throws Exception {
            // Given
            when(espacioPublicoService.obtenerPorCategoria("PLAZA"))
                    .thenReturn(Arrays.asList(testResponseDTO));

            // When & Then
            mockMvc.perform(get("/api/espacio-publico").param("categoria", "PLAZA"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].categoria").value("PLAZA"));

            verify(espacioPublicoService).obtenerPorCategoria("PLAZA");
        }
    }

    @Nested
    @DisplayName("Tests de GET /api/espacio-publico/{id}")
    class ObtenerPorIdTests {

        @Test
        @DisplayName("Debe retornar espacio con status 200")
        void obtenerPorId_ConIdExistente_RetornaOk() throws Exception {
            // Given
            when(espacioPublicoService.obtenerPorId(1L)).thenReturn(testResponseDTO);

            // When & Then
            mockMvc.perform(get("/api/espacio-publico/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.titulo").value("Plaza Principal"));
        }

        @Test
        @DisplayName("Debe retornar status 404 cuando no existe")
        void obtenerPorId_ConIdNoExistente_RetornaNotFound() throws Exception {
            // Given
            when(espacioPublicoService.obtenerPorId(999L))
                    .thenThrow(new EspacioPublicoNotFoundException(999L));

            // When & Then
            mockMvc.perform(get("/api/espacio-publico/999"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Tests de PUT /api/espacio-publico/{id}")
    class ActualizarTests {

        @Test
        @DisplayName("Debe actualizar espacio con status 200")
        void actualizar_ConDatosValidos_RetornaOk() throws Exception {
            // Given
            when(espacioPublicoService.actualizarCompleto(eq(1L), any(EspacioPublicoRequestDTO.class)))
                    .thenReturn(testResponseDTO);

            // When & Then
            mockMvc.perform(put("/api/espacio-publico/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRequestDTO)))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Tests de DELETE /api/espacio-publico/{id}")
    class EliminarTests {

        @Test
        @DisplayName("Debe eliminar espacio con status 204")
        void eliminar_ConIdExistente_RetornaNoContent() throws Exception {
            // Given
            doNothing().when(espacioPublicoService).eliminar(1L);

            // When & Then
            mockMvc.perform(delete("/api/espacio-publico/1"))
                    .andExpect(status().isNoContent());

            verify(espacioPublicoService).eliminar(1L);
        }

        @Test
        @DisplayName("Debe retornar status 404 cuando espacio no existe")
        void eliminar_ConIdNoExistente_RetornaNotFound() throws Exception {
            // Given
            doThrow(new EspacioPublicoNotFoundException(999L))
                    .when(espacioPublicoService).eliminar(999L);

            // When & Then
            mockMvc.perform(delete("/api/espacio-publico/999"))
                    .andExpect(status().isNotFound());
        }
    }
}
