package com.tapalque.gastronomia.demo.service;

import com.tapalque.gastronomia.demo.DTO.RestaurantDTO;
import com.tapalque.gastronomia.demo.Entity.Category;
import com.tapalque.gastronomia.demo.Entity.Restaurant;
import com.tapalque.gastronomia.demo.Repository.CategoryRepositoriInterface;
import com.tapalque.gastronomia.demo.Repository.LocalRepositoryInterface;
import com.tapalque.gastronomia.demo.Service.RestaurantService;

import jakarta.persistence.EntityNotFoundException;

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
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RestaurantService Tests")
class RestaurantServiceTest {

    @Mock
    private LocalRepositoryInterface localGastronomicoRepository;

    @Mock
    private CategoryRepositoriInterface categoryRepository;

    @InjectMocks
    private RestaurantService restaurantService;

    private Restaurant testRestaurant;
    private RestaurantDTO testRestaurantDTO;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        testCategory = new Category();
        testCategory.setIdCategory(1L);
        testCategory.setName("Parrilla");

        testRestaurant = new Restaurant();
        testRestaurant.setIdRestaurant(1L);
        testRestaurant.setName("La Esquina");
        testRestaurant.setAddress("Calle 123");
        testRestaurant.setEmail("esquina@test.com");
        testRestaurant.setDelivery(true);
        testRestaurant.setCoordinate_lat(-36.3629);
        testRestaurant.setCoordinate_lon(-60.0243);
        testRestaurant.setCategories(Arrays.asList(testCategory));

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
    @DisplayName("Tests de getRestaurantById")
    class GetRestaurantByIdTests {

        @Test
        @DisplayName("Debe retornar restaurante cuando existe")
        void getRestaurantById_ConIdExistente_RetornaRestaurante() {
            // Given
            when(localGastronomicoRepository.selectRestaurantById(1L))
                    .thenReturn(Optional.of(testRestaurantDTO));

            // When
            RestaurantDTO result = restaurantService.getRestaurantById(1L);

            // Then
            assertNotNull(result);
            assertEquals("La Esquina", result.getName());
            assertEquals("Calle 123", result.getAddress());
            verify(localGastronomicoRepository).selectRestaurantById(1L);
        }

        @Test
        @DisplayName("Debe lanzar EntityNotFoundException cuando no existe")
        void getRestaurantById_ConIdNoExistente_LanzaExcepcion() {
            // Given
            when(localGastronomicoRepository.selectRestaurantById(999L))
                    .thenReturn(Optional.empty());

            // When & Then
            EntityNotFoundException exception = assertThrows(
                    EntityNotFoundException.class,
                    () -> restaurantService.getRestaurantById(999L)
            );
            assertTrue(exception.getMessage().contains("999"));
            verify(localGastronomicoRepository).selectRestaurantById(999L);
        }
    }

    @Nested
    @DisplayName("Tests de getAllLocalGastronomicos")
    class GetAllLocalGastronomicosTests {

        @Test
        @DisplayName("Debe retornar lista de restaurantes")
        void getAllLocalGastronomicos_RetornaLista() {
            // Given
            RestaurantDTO dto2 = new RestaurantDTO();
            dto2.setId(2L);
            dto2.setName("El Rincón");

            when(localGastronomicoRepository.selectAllRestaurant())
                    .thenReturn(Arrays.asList(testRestaurantDTO, dto2));

            // When
            List<RestaurantDTO> result = restaurantService.getAllLocalGastronomicos();

            // Then
            assertNotNull(result);
            assertEquals(2, result.size());
            verify(localGastronomicoRepository).selectAllRestaurant();
        }

        @Test
        @DisplayName("Debe retornar lista vacía cuando no hay restaurantes")
        void getAllLocalGastronomicos_SinRestaurantes_RetornaListaVacia() {
            // Given
            when(localGastronomicoRepository.selectAllRestaurant())
                    .thenReturn(Collections.emptyList());

            // When
            List<RestaurantDTO> result = restaurantService.getAllLocalGastronomicos();

            // Then
            assertNotNull(result);
            assertTrue(result.isEmpty());
            verify(localGastronomicoRepository).selectAllRestaurant();
        }
    }

    @Nested
    @DisplayName("Tests de addRestaurant")
    class AddRestaurantTests {

        @Test
        @DisplayName("Debe guardar restaurante con categorías existentes")
        void addRestaurant_ConCategoriasExistentes_GuardaRestaurante() {
            // Given
            RestaurantDTO inputDto = new RestaurantDTO();
            inputDto.setName("Nuevo Restaurante");
            inputDto.setAddress("Dirección Nueva");
            inputDto.setEmail("nuevo@test.com");
            inputDto.setDelivery(false);
            inputDto.setLatitude(-36.0);
            inputDto.setLongitude(-60.0);
            inputDto.setCategories("Parrilla");

            when(categoryRepository.findByName("Parrilla"))
                    .thenReturn(Optional.of(testCategory));
            when(localGastronomicoRepository.save(any(Restaurant.class)))
                    .thenAnswer(invocation -> {
                        Restaurant saved = invocation.getArgument(0);
                        saved.setIdRestaurant(1L);
                        return saved;
                    });

            // When
            RestaurantDTO result = restaurantService.addRestaurant(inputDto);

            // Then
            assertNotNull(result);
            assertEquals("Nuevo Restaurante", result.getName());
            verify(categoryRepository).findByName("Parrilla");
            verify(localGastronomicoRepository).save(any(Restaurant.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si categoría no existe")
        void addRestaurant_ConCategoriaInexistente_LanzaExcepcion() {
            // Given
            RestaurantDTO inputDto = new RestaurantDTO();
            inputDto.setName("Nuevo Restaurante");
            inputDto.setAddress("Dirección Nueva");
            inputDto.setEmail("nuevo@test.com");
            inputDto.setDelivery(false);
            inputDto.setLatitude(-36.0);
            inputDto.setLongitude(-60.0);
            inputDto.setCategories("CategoriaInexistente");

            when(categoryRepository.findByName("CategoriaInexistente"))
                    .thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(
                    RuntimeException.class,
                    () -> restaurantService.addRestaurant(inputDto)
            );
            assertTrue(exception.getMessage().contains("Categoría no encontrada"));
            verify(localGastronomicoRepository, never()).save(any(Restaurant.class));
        }

        @Test
        @DisplayName("Debe guardar restaurante sin categorías")
        void addRestaurant_SinCategorias_GuardaRestaurante() {
            // Given
            RestaurantDTO inputDto = new RestaurantDTO();
            inputDto.setName("Restaurante Simple");
            inputDto.setAddress("Dirección Simple");
            inputDto.setEmail("simple@test.com");
            inputDto.setDelivery(true);
            inputDto.setLatitude(-36.0);
            inputDto.setLongitude(-60.0);
            // Sin categorías

            when(localGastronomicoRepository.save(any(Restaurant.class)))
                    .thenAnswer(invocation -> {
                        Restaurant saved = invocation.getArgument(0);
                        saved.setIdRestaurant(1L);
                        return saved;
                    });

            // When
            RestaurantDTO result = restaurantService.addRestaurant(inputDto);

            // Then
            assertNotNull(result);
            assertEquals("Restaurante Simple", result.getName());
            verify(categoryRepository, never()).findByName(anyString());
            verify(localGastronomicoRepository).save(any(Restaurant.class));
        }
    }

    @Nested
    @DisplayName("Tests de updateRestaurant")
    class UpdateRestaurantTests {

        @Test
        @DisplayName("Debe actualizar restaurante existente")
        void updateRestaurant_ConIdExistente_ActualizaRestaurante() {
            // Given
            when(localGastronomicoRepository.existsById(1L)).thenReturn(true);
            when(localGastronomicoRepository.save(any(Restaurant.class)))
                    .thenReturn(testRestaurant);

            // When
            assertDoesNotThrow(() -> restaurantService.updateRestaurant(testRestaurant));

            // Then
            verify(localGastronomicoRepository).existsById(1L);
            verify(localGastronomicoRepository).save(testRestaurant);
        }

        @Test
        @DisplayName("Debe lanzar excepción si restaurante no existe")
        void updateRestaurant_ConIdNoExistente_LanzaExcepcion() {
            // Given
            Restaurant nonExistent = new Restaurant();
            nonExistent.setIdRestaurant(999L);
            when(localGastronomicoRepository.existsById(999L)).thenReturn(false);

            // When & Then
            EntityNotFoundException exception = assertThrows(
                    EntityNotFoundException.class,
                    () -> restaurantService.updateRestaurant(nonExistent)
            );
            assertTrue(exception.getMessage().contains("999"));
            verify(localGastronomicoRepository, never()).save(any(Restaurant.class));
        }

        @Test
        @DisplayName("Debe lanzar excepción si id es nulo")
        void updateRestaurant_ConIdNulo_LanzaExcepcion() {
            // Given
            Restaurant nullIdRestaurant = new Restaurant();
            nullIdRestaurant.setIdRestaurant(null);

            // When & Then
            EntityNotFoundException exception = assertThrows(
                    EntityNotFoundException.class,
                    () -> restaurantService.updateRestaurant(nullIdRestaurant)
            );
            assertTrue(exception.getMessage().contains("nulo"));
            verify(localGastronomicoRepository, never()).existsById(anyLong());
        }
    }

    @Nested
    @DisplayName("Tests de deleteRestaurant")
    class DeleteRestaurantTests {

        @Test
        @DisplayName("Debe eliminar restaurante existente")
        void deleteRestaurant_ConIdExistente_EliminaRestaurante() {
            // Given
            when(localGastronomicoRepository.existsById(1L)).thenReturn(true);
            doNothing().when(localGastronomicoRepository).deleteById(1L);

            // When
            assertDoesNotThrow(() -> restaurantService.deleteRestaurant(1L));

            // Then
            verify(localGastronomicoRepository).existsById(1L);
            verify(localGastronomicoRepository).deleteById(1L);
        }

        @Test
        @DisplayName("Debe lanzar excepción si restaurante no existe")
        void deleteRestaurant_ConIdNoExistente_LanzaExcepcion() {
            // Given
            when(localGastronomicoRepository.existsById(999L)).thenReturn(false);

            // When & Then
            EntityNotFoundException exception = assertThrows(
                    EntityNotFoundException.class,
                    () -> restaurantService.deleteRestaurant(999L)
            );
            assertTrue(exception.getMessage().contains("999"));
            verify(localGastronomicoRepository, never()).deleteById(anyLong());
        }
    }
}
