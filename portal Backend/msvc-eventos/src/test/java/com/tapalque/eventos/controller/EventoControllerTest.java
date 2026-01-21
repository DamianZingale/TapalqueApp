package com.tapalque.eventos.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.tapalque.eventos.Exceptions.EventoNotFoundException;
import com.tapalque.eventos.dto.EventoRequestDTO;
import com.tapalque.eventos.dto.EventoResponseDTO;
import com.tapalque.eventos.service.EventoService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EventoController.class)
@DisplayName("EventoController Tests")
class EventoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @MockBean
    private EventoService eventoService;

    private EventoResponseDTO testResponseDTO;
    private EventoRequestDTO testRequestDTO;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        testResponseDTO = new EventoResponseDTO();
        testResponseDTO.setId(1L);
        testResponseDTO.setNombreEvento("Festival de Verano");
        testResponseDTO.setLugar("Plaza Principal");
        testResponseDTO.setHorario("20:00 - 00:00");
        testResponseDTO.setFechaInicio(LocalDate.of(2026, 1, 15));
        testResponseDTO.setFechaFin(LocalDate.of(2026, 1, 17));
        testResponseDTO.setImagenes(Collections.emptyList());

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
    @DisplayName("Tests de POST /api/evento")
    class CrearTests {

        @Test
        @DisplayName("Debe crear evento con status 201")
        void crear_ConDatosValidos_RetornaCreated() throws Exception {
            // Given
            when(eventoService.crear(any(EventoRequestDTO.class))).thenReturn(testResponseDTO);

            // When & Then
            mockMvc.perform(post("/api/evento")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRequestDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.nombreEvento").value("Festival de Verano"));

            verify(eventoService).crear(any(EventoRequestDTO.class));
        }
    }

    @Nested
    @DisplayName("Tests de GET /api/evento")
    class ListarTests {

        @Test
        @DisplayName("Debe retornar lista de eventos con status 200")
        void listar_ConEventos_RetornaOk() throws Exception {
            // Given
            EventoResponseDTO dto2 = new EventoResponseDTO();
            dto2.setId(2L);
            dto2.setNombreEvento("Concierto Rock");
            dto2.setImagenes(Collections.emptyList());

            when(eventoService.obtenerTodos()).thenReturn(Arrays.asList(testResponseDTO, dto2));

            // When & Then
            mockMvc.perform(get("/api/evento"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].nombreEvento").value("Festival de Verano"))
                    .andExpect(jsonPath("$[1].nombreEvento").value("Concierto Rock"));
        }
    }

    @Nested
    @DisplayName("Tests de GET /api/evento/{id}")
    class ObtenerPorIdTests {

        @Test
        @DisplayName("Debe retornar evento con status 200")
        void obtenerPorId_ConIdExistente_RetornaOk() throws Exception {
            // Given
            when(eventoService.obtenerPorId(1L)).thenReturn(testResponseDTO);

            // When & Then
            mockMvc.perform(get("/api/evento/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.nombreEvento").value("Festival de Verano"));
        }

        @Test
        @DisplayName("Debe retornar status 404 cuando no existe")
        void obtenerPorId_ConIdNoExistente_RetornaNotFound() throws Exception {
            // Given
            when(eventoService.obtenerPorId(999L)).thenThrow(new EventoNotFoundException(999L));

            // When & Then
            mockMvc.perform(get("/api/evento/999"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Tests de PUT /api/evento/{id}")
    class ActualizarTests {

        @Test
        @DisplayName("Debe actualizar evento con status 200")
        void actualizar_ConDatosValidos_RetornaOk() throws Exception {
            // Given
            when(eventoService.actualizarCompleto(eq(1L), any(EventoRequestDTO.class)))
                    .thenReturn(testResponseDTO);

            // When & Then
            mockMvc.perform(put("/api/evento/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRequestDTO)))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Tests de PATCH /api/evento/{id}")
    class ActualizarParcialTests {

        @Test
        @DisplayName("Debe actualizar parcialmente con status 200")
        void actualizarParcial_ConDatosValidos_RetornaOk() throws Exception {
            // Given
            when(eventoService.actualizarParcial(eq(1L), any(EventoRequestDTO.class)))
                    .thenReturn(testResponseDTO);

            // When & Then
            mockMvc.perform(patch("/api/evento/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testRequestDTO)))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Tests de DELETE /api/evento/{id}")
    class EliminarTests {

        @Test
        @DisplayName("Debe eliminar evento con status 204")
        void eliminar_ConIdExistente_RetornaNoContent() throws Exception {
            // Given
            doNothing().when(eventoService).eliminar(1L);

            // When & Then
            mockMvc.perform(delete("/api/evento/1"))
                    .andExpect(status().isNoContent());

            verify(eventoService).eliminar(1L);
        }

        @Test
        @DisplayName("Debe retornar status 404 cuando evento no existe")
        void eliminar_ConIdNoExistente_RetornaNotFound() throws Exception {
            // Given
            doThrow(new EventoNotFoundException(999L)).when(eventoService).eliminar(999L);

            // When & Then
            mockMvc.perform(delete("/api/evento/999"))
                    .andExpect(status().isNotFound());
        }
    }
}
