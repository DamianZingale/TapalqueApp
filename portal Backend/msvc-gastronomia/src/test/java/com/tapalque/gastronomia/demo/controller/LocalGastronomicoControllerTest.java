package com.tapalque.gastronomia.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tapalque.gastronomia.demo.Controller.LocalGastronomicoController;
import com.tapalque.gastronomia.demo.DTO.RestaurantDTO;
import com.tapalque.gastronomia.demo.Entity.Restaurant;
import com.tapalque.gastronomia.demo.Service.I_RestaurantService;

import jakarta.persistence.EntityNotFoundException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.tapalque.gastronomia.demo.Exceptions.GlobalExceptionHandler;

import java.util.Arrays;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = LocalGastronomicoController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = GlobalExceptionHandler.class))
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("LocalGastronomicoController Tests")
class LocalGastronomicoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private I_RestaurantService localGastronomicoService;

    private RestaurantDTO testRestaurantDTO;

    @BeforeEach
    void setUp() {
        testRestaurantDTO = new RestaurantDTO();
        testRestaurantDTO.setId(1L);
        testRestaurantDTO.setName("La Esquina");
        testRestaurantDTO.setAddress("Calle 123");
        testRestaurantDTO.setEmail("esquina@test.com");
        testRestaurantDTO.setDelivery(true);
        testRestaurantDTO.setLatitude(-36.3629);
        testRestaurantDTO.setLongitude(-60.0243);
        testRestaurantDTO.setCategories("Parrilla");
    }

    @Nested
    @DisplayName("Tests de GET /restaurante/findAll")
    class FindAllTests {

        @Test
        @DisplayName("Debe retornar lista de restaurantes con status 200")
        void findAll_ConRestaurantes_RetornaOk() throws Exception {
            // Given
            RestaurantDTO dto2 = new RestaurantDTO();
            dto2.setId(2L);
            dto2.setName("El Rincón");

            when(localGastronomicoService.getAllLocalGastronomicos())
                    .thenReturn(Arrays.asList(testRestaurantDTO, dto2));

            // When & Then
            mockMvc.perform(get("/restaurante/findAll"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$[0].name").value("La Esquina"))
                    .andExpect(jsonPath("$[1].name").value("El Rincón"));

            verify(localGastronomicoService).getAllLocalGastronomicos();
        }

        @Test
        @DisplayName("Debe retornar status 204 cuando no hay restaurantes")
        void findAll_SinRestaurantes_RetornaNoContent() throws Exception {
            // Given
            when(localGastronomicoService.getAllLocalGastronomicos())
                    .thenReturn(Collections.emptyList());

            // When & Then
            mockMvc.perform(get("/restaurante/findAll"))
                    .andExpect(status().isNoContent());

            verify(localGastronomicoService).getAllLocalGastronomicos();
        }
    }

    @Nested
    @DisplayName("Tests de GET /restaurante/findById/{id}")
    class FindByIdTests {

        @Test
        @DisplayName("Debe retornar restaurante con status 200")
        void findById_ConIdExistente_RetornaOk() throws Exception {
            // Given
            when(localGastronomicoService.getRestaurantById(1L))
                    .thenReturn(testRestaurantDTO);

            // When & Then
            mockMvc.perform(get("/restaurante/findById/1"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.name").value("La Esquina"))
                    .andExpect(jsonPath("$.address").value("Calle 123"));

            verify(localGastronomicoService).getRestaurantById(1L);
        }

        @Test
        @DisplayName("Debe retornar status 404 cuando no existe")
        void findById_ConIdNoExistente_RetornaNotFound() throws Exception {
            // Given
            when(localGastronomicoService.getRestaurantById(999L))
                    .thenThrow(new EntityNotFoundException("Restaurant not found"));

            // When & Then
            mockMvc.perform(get("/restaurante/findById/999"))
                    .andExpect(status().isNotFound());

            verify(localGastronomicoService).getRestaurantById(999L);
        }
    }

    @Nested
    @DisplayName("Tests de POST /restaurante/save")
    class SaveTests {

        @Test
        @DisplayName("Debe crear restaurante con status 201")
        void save_ConDatosValidos_RetornaCreated() throws Exception {
            // Given
            RestaurantDTO inputDto = new RestaurantDTO();
            inputDto.setName("Nuevo Restaurante");
            inputDto.setAddress("Dirección Nueva");
            inputDto.setEmail("nuevo@test.com");
            inputDto.setDelivery(false);
            inputDto.setLatitude(-36.0);
            inputDto.setLongitude(-60.0);

            RestaurantDTO savedDto = new RestaurantDTO();
            savedDto.setId(1L);
            savedDto.setName("Nuevo Restaurante");
            savedDto.setAddress("Dirección Nueva");
            savedDto.setEmail("nuevo@test.com");

            when(localGastronomicoService.addRestaurant(any(RestaurantDTO.class)))
                    .thenReturn(savedDto);

            // When & Then
            mockMvc.perform(post("/restaurante/save")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(inputDto)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.name").value("Nuevo Restaurante"));

            verify(localGastronomicoService).addRestaurant(any(RestaurantDTO.class));
        }

        @Test
        @DisplayName("Debe retornar status 400 cuando servicio retorna null")
        void save_ConErrorEnServicio_RetornaBadRequest() throws Exception {
            // Given
            RestaurantDTO inputDto = new RestaurantDTO();
            inputDto.setName("Restaurante");
            inputDto.setAddress("Dirección");
            inputDto.setEmail("test@test.com");

            when(localGastronomicoService.addRestaurant(any(RestaurantDTO.class)))
                    .thenReturn(null);

            // When & Then
            mockMvc.perform(post("/restaurante/save")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(inputDto)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Tests de PUT /restaurante/update/{id}")
    class UpdateTests {

        @Test
        @DisplayName("Debe actualizar restaurante con status 200")
        void update_ConDatosValidos_RetornaOk() throws Exception {
            // Given
            RestaurantDTO inputDto = new RestaurantDTO();
            inputDto.setName("Restaurante Actualizado");
            inputDto.setAddress("Nueva Dirección");
            inputDto.setEmail("actualizado@test.com");
            inputDto.setDelivery(true);
            inputDto.setLatitude(-36.0);
            inputDto.setLongitude(-60.0);

            doNothing().when(localGastronomicoService).updateRestaurant(any(Restaurant.class));

            // When & Then
            mockMvc.perform(put("/restaurante/update/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(inputDto)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Restaurante Actualizado"));

            verify(localGastronomicoService).updateRestaurant(any(Restaurant.class));
        }

        @Test
        @DisplayName("Debe retornar status 404 cuando restaurante no existe")
        void update_ConIdNoExistente_RetornaNotFound() throws Exception {
            // Given
            RestaurantDTO inputDto = new RestaurantDTO();
            inputDto.setName("Restaurante");
            inputDto.setAddress("Dirección");
            inputDto.setEmail("test@test.com");

            doThrow(new EntityNotFoundException("No existe"))
                    .when(localGastronomicoService).updateRestaurant(any(Restaurant.class));

            // When & Then
            mockMvc.perform(put("/restaurante/update/999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(inputDto)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Tests de DELETE /restaurante/delete/{id}")
    class DeleteTests {

        @Test
        @DisplayName("Debe eliminar restaurante con status 204")
        void delete_ConIdExistente_RetornaNoContent() throws Exception {
            // Given
            doNothing().when(localGastronomicoService).deleteRestaurant(1L);

            // When & Then
            mockMvc.perform(delete("/restaurante/delete/1"))
                    .andExpect(status().isNoContent());

            verify(localGastronomicoService).deleteRestaurant(1L);
        }

        @Test
        @DisplayName("Debe retornar status 404 cuando restaurante no existe")
        void delete_ConIdNoExistente_RetornaNotFound() throws Exception {
            // Given
            doThrow(new EntityNotFoundException("No existe"))
                    .when(localGastronomicoService).deleteRestaurant(999L);

            // When & Then
            mockMvc.perform(delete("/restaurante/delete/999"))
                    .andExpect(status().isNotFound());

            verify(localGastronomicoService).deleteRestaurant(999L);
        }
    }
}
