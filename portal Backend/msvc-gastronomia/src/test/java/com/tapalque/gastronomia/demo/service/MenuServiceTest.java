package com.tapalque.gastronomia.demo.service;

import com.tapalque.gastronomia.demo.DTO.MenuDTO;
import com.tapalque.gastronomia.demo.Entity.Menu;
import com.tapalque.gastronomia.demo.Entity.Restaurant;
import com.tapalque.gastronomia.demo.Repository.MenuRepositoryInterface;
import com.tapalque.gastronomia.demo.Service.MenuService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MenuService Tests")
class MenuServiceTest {

    @Mock
    private MenuRepositoryInterface menuRepository;

    @InjectMocks
    private MenuService menuService;

    private Menu testMenu;
    private Restaurant testRestaurant;

    @BeforeEach
    void setUp() {
        testRestaurant = new Restaurant();
        testRestaurant.setIdRestaurant(1L);
        testRestaurant.setName("Test Restaurant");

        testMenu = new Menu();
        testMenu.setIdMenu(1L);
        testMenu.setDescription("Menú de prueba");
        testMenu.setRestaurant(testRestaurant);
        testMenu.setDishes(Collections.emptyList());
    }

    @Nested
    @DisplayName("Tests de getMenuByRestaurantId")
    class GetMenuByRestaurantIdTests {

        @Test
        @DisplayName("Debe retornar MenuDTO cuando existe menú para el restaurante")
        void getMenuByRestaurantId_ConIdExistente_RetornaMenuDTO() {
            // Given
            when(menuRepository.findByRestaurantIdRestaurant(1L))
                    .thenReturn(Optional.of(testMenu));

            // When
            MenuDTO result = menuService.getMenuByRestaurantId(1L);

            // Then
            assertNotNull(result);
            assertEquals(1L, result.getId());
            assertEquals("Menú de prueba", result.getDescription());
            assertEquals(1L, result.getRestaurantId());
            verify(menuRepository).findByRestaurantIdRestaurant(1L);
        }

        @Test
        @DisplayName("Debe retornar menú vacío cuando no existe menú para el restaurante")
        void getMenuByRestaurantId_ConIdNoExistente_RetornaMenuVacio() {
            // Given
            when(menuRepository.findByRestaurantIdRestaurant(999L))
                    .thenReturn(Optional.empty());

            // When
            MenuDTO result = menuService.getMenuByRestaurantId(999L);

            // Then
            assertNotNull(result);
            assertEquals("Menú no disponible", result.getDescription());
            assertTrue(result.getDishes().isEmpty());
            verify(menuRepository).findByRestaurantIdRestaurant(999L);
        }

        @Test
        @DisplayName("Debe manejar menú sin platos")
        void getMenuByRestaurantId_MenuSinPlatos_RetornaMenuDTOConListaVacia() {
            // Given
            testMenu.setDishes(Collections.emptyList());
            when(menuRepository.findByRestaurantIdRestaurant(1L))
                    .thenReturn(Optional.of(testMenu));

            // When
            MenuDTO result = menuService.getMenuByRestaurantId(1L);

            // Then
            assertNotNull(result);
            assertNotNull(result.getDishes());
            assertTrue(result.getDishes().isEmpty());
        }

        @Test
        @DisplayName("Debe manejar menú con platos nulos retornando lista vacía")
        void getMenuByRestaurantId_MenuConPlatosNulos_RetornaMenuDTO() {
            // Given
            testMenu.setDishes(null);
            when(menuRepository.findByRestaurantIdRestaurant(1L))
                    .thenReturn(Optional.of(testMenu));

            // When
            MenuDTO result = menuService.getMenuByRestaurantId(1L);

            // Then
            assertNotNull(result);
            assertNotNull(result.getDishes());
            assertTrue(result.getDishes().isEmpty());
        }
    }
}
