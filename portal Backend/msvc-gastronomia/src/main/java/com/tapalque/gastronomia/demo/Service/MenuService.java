package com.tapalque.gastronomia.demo.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tapalque.gastronomia.demo.DTO.DishCategoryDTO;
import com.tapalque.gastronomia.demo.DTO.DishDTO;
import com.tapalque.gastronomia.demo.DTO.DishRestrictionDTO;
import com.tapalque.gastronomia.demo.DTO.MenuDTO;
import com.tapalque.gastronomia.demo.Entity.Dish;
import com.tapalque.gastronomia.demo.Entity.DishCategory;
import com.tapalque.gastronomia.demo.Entity.DishRestriction;
import com.tapalque.gastronomia.demo.Entity.Ingredient;
import com.tapalque.gastronomia.demo.Entity.Menu;
import com.tapalque.gastronomia.demo.Entity.Restaurant;
import com.tapalque.gastronomia.demo.Repository.DishCategoryRepository;
import com.tapalque.gastronomia.demo.Repository.DishRepository;
import com.tapalque.gastronomia.demo.Repository.DishRestrictionRepository;
import com.tapalque.gastronomia.demo.Repository.IngredientRepository;
import com.tapalque.gastronomia.demo.Repository.LocalRepositoryInterface;
import com.tapalque.gastronomia.demo.Repository.MenuRepositoryInterface;
import com.tapalque.gastronomia.demo.enu.DishCategoryEnum;

@Service
@Transactional(readOnly = true)
public class MenuService implements MenuServiceInterface {

    private final MenuRepositoryInterface menuRepository;
    private final DishRepository dishRepository;
    private final DishCategoryRepository dishCategoryRepository;
    private final DishRestrictionRepository dishRestrictionRepository;
    private final IngredientRepository ingredientRepository;
    private final LocalRepositoryInterface restaurantRepository;

    public MenuService(MenuRepositoryInterface menuRepository,
                       DishRepository dishRepository,
                       DishCategoryRepository dishCategoryRepository,
                       DishRestrictionRepository dishRestrictionRepository,
                       IngredientRepository ingredientRepository,
                       LocalRepositoryInterface restaurantRepository) {
        this.menuRepository = menuRepository;
        this.dishRepository = dishRepository;
        this.dishCategoryRepository = dishCategoryRepository;
        this.dishRestrictionRepository = dishRestrictionRepository;
        this.ingredientRepository = ingredientRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @Cacheable(value = "menus", key = "#idRestaurant")
    @Override
    public MenuDTO getMenuByRestaurantId(Long idRestaurant) {
        Optional<Menu> menuOptional = menuRepository.findByRestaurantIdRestaurant(idRestaurant);

        if (menuOptional.isEmpty()) {
            MenuDTO emptyMenu = new MenuDTO();
            emptyMenu.setDescription("Menú no disponible");
            emptyMenu.setDishes(new ArrayList<>());
            return emptyMenu;
        }

        Menu menu = menuOptional.get();
        return MenuDTO.fromEntity(menu);
    }

    @Override
    public MenuDTO getMenuFiltered(Long idRestaurant, String category, List<String> restrictions) {
        MenuDTO menu = getMenuByRestaurantId(idRestaurant);

        if (menu.getDishes() == null || menu.getDishes().isEmpty()) {
            return menu;
        }

        List<DishDTO> filteredDishes = menu.getDishes().stream()
            .filter(dish -> {
                // Filtrar por categoría si se especifica
                if (category != null && !category.isEmpty()) {
                    boolean hasCategory = dish.getCategories() != null &&
                        dish.getCategories().stream()
                            .anyMatch(c -> c.getName().equalsIgnoreCase(category));
                    if (!hasCategory) {
                        return false;
                    }
                }

                // Filtrar por restricciones si se especifican
                if (restrictions != null && !restrictions.isEmpty()) {
                    if (dish.getRestrictions() == null) {
                        return false;
                    }
                    List<String> dishRestrictionNames = dish.getRestrictions().stream()
                        .map(DishRestrictionDTO::getName)
                        .map(String::toLowerCase)
                        .collect(Collectors.toList());

                    // El plato debe tener TODAS las restricciones especificadas
                    for (String restriction : restrictions) {
                        if (!dishRestrictionNames.contains(restriction.toLowerCase())) {
                            return false;
                        }
                    }
                }

                return true;
            })
            .collect(Collectors.toList());

        menu.setDishes(filteredDishes);
        return menu;
    }

    @Cacheable(value = "menu-categorias")
    @Override
    public List<DishCategoryDTO> getAllCategories() {
        // Retornar todas las categorías del enum, no solo las que están en la BD
        return DishCategoryEnum.getAllCategoryNames().stream()
            .map(name -> {
                DishCategoryDTO dto = new DishCategoryDTO();
                dto.setName(name);
                // El ID no es necesario ya que trabajamos con nombres
                dto.setIdDishCategory(0L);
                return dto;
            })
            .collect(Collectors.toList());
    }

    @Cacheable(value = "menu-restricciones")
    @Override
    public List<DishRestrictionDTO> getAllRestrictions() {
        return dishRestrictionRepository.findAll().stream()
            .map(DishRestrictionDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @CacheEvict(value = "menus", allEntries = true)
    @Override
    @Transactional
    public DishDTO createDish(Long restaurantId, DishDTO dishDTO) {
        // Obtener o crear el menú del restaurante
        Menu menu = menuRepository.findByRestaurantIdRestaurant(restaurantId)
            .orElseGet(() -> {
                // Si no existe el menú, crear uno nuevo
                Restaurant restaurant = restaurantRepository.findById(restaurantId)
                    .orElseThrow(() -> new IllegalArgumentException("No se encontró el restaurante con ID " + restaurantId));

                Menu newMenu = new Menu();
                newMenu.setName("Menú de " + restaurant.getName());
                newMenu.setDescription("Menú de " + restaurant.getName());
                newMenu.setRestaurant(restaurant);
                return menuRepository.save(newMenu);
            });

        // Crear nueva entidad Dish
        Dish dish = new Dish();
        dish.setName(dishDTO.getName());
        dish.setPrice(dishDTO.getPrice());
        dish.setDescription(dishDTO.getDescription());
        dish.setAvailable(dishDTO.getAvailable() != null ? dishDTO.getAvailable() : true);
        dish.setPicture(dishDTO.getPicture());
        dish.setMenu(menu);

        // Asignar categorías si existen
        if (dishDTO.getCategories() != null && !dishDTO.getCategories().isEmpty()) {
            List<DishCategory> categories = dishDTO.getCategories().stream()
                .map(catDTO -> {
                    // Si tiene ID, buscar por ID
                    if (catDTO.getIdDishCategory() != null) {
                        return dishCategoryRepository.findById(catDTO.getIdDishCategory()).orElse(null);
                    }
                    // Si no tiene ID pero tiene nombre, buscar o crear por nombre
                    if (catDTO.getName() != null && !catDTO.getName().trim().isEmpty()) {
                        return dishCategoryRepository.findByName(catDTO.getName())
                            .orElseGet(() -> {
                                DishCategory newCategory = new DishCategory();
                                newCategory.setName(catDTO.getName());
                                return dishCategoryRepository.save(newCategory);
                            });
                    }
                    return null;
                })
                .filter(cat -> cat != null)
                .collect(Collectors.toList());
            dish.setCategories(categories);
        }

        // Asignar restricciones si existen
        if (dishDTO.getRestrictions() != null && !dishDTO.getRestrictions().isEmpty()) {
            List<DishRestriction> restrictions = dishDTO.getRestrictions().stream()
                .map(resDTO -> {
                    // Si tiene ID, buscar por ID
                    if (resDTO.getIdRestriction() != null) {
                        return dishRestrictionRepository.findById(resDTO.getIdRestriction()).orElse(null);
                    }
                    // Si no tiene ID pero tiene nombre, buscar o crear por nombre
                    if (resDTO.getName() != null && !resDTO.getName().trim().isEmpty()) {
                        return dishRestrictionRepository.findByName(resDTO.getName())
                            .orElseGet(() -> {
                                DishRestriction newRestriction = new DishRestriction();
                                newRestriction.setName(resDTO.getName());
                                return dishRestrictionRepository.save(newRestriction);
                            });
                    }
                    return null;
                })
                .filter(res -> res != null)
                .collect(Collectors.toList());
            dish.setRestrictions(restrictions);
        }

        // Asignar ingredientes si existen
        if (dishDTO.getIngredients() != null && !dishDTO.getIngredients().isEmpty()) {
            List<Ingredient> ingredients = dishDTO.getIngredients().stream()
                .map(ingDTO -> {
                    // Si tiene ID, buscar por ID
                    if (ingDTO.getIdIngredient() != null) {
                        return ingredientRepository.findById(ingDTO.getIdIngredient()).orElse(null);
                    }
                    // Si no tiene ID pero tiene nombre, buscar o crear por nombre
                    if (ingDTO.getName() != null && !ingDTO.getName().trim().isEmpty()) {
                        return ingredientRepository.findByName(ingDTO.getName())
                            .orElseGet(() -> {
                                Ingredient newIngredient = new Ingredient();
                                newIngredient.setName(ingDTO.getName());
                                return ingredientRepository.save(newIngredient);
                            });
                    }
                    return null;
                })
                .filter(ing -> ing != null)
                .collect(Collectors.toList());
            dish.setIngredients(ingredients);
        }

        Dish savedDish = dishRepository.save(dish);
        return DishDTO.fromEntity(savedDish);
    }

    @CacheEvict(value = "menus", allEntries = true)
    @Override
    @Transactional
    public DishDTO updateDish(Long dishId, DishDTO dishDTO) {
        Dish dish = dishRepository.findById(dishId)
            .orElseThrow(() -> new IllegalArgumentException("No se encontró el plato con ID " + dishId));

        // Actualizar campos básicos solo si no son null
        if (dishDTO.getName() != null) {
            dish.setName(dishDTO.getName());
        }
        if (dishDTO.getPrice() != null) {
            dish.setPrice(dishDTO.getPrice());
        }
        if (dishDTO.getDescription() != null) {
            dish.setDescription(dishDTO.getDescription());
        }
        if (dishDTO.getAvailable() != null) {
            dish.setAvailable(dishDTO.getAvailable());
        }
        if (dishDTO.getPicture() != null) {
            dish.setPicture(dishDTO.getPicture());
        }

        // Actualizar categorías si se proporcionan
        if (dishDTO.getCategories() != null) {
            List<DishCategory> categories = dishDTO.getCategories().stream()
                .map(catDTO -> {
                    // Si tiene ID, buscar por ID
                    if (catDTO.getIdDishCategory() != null) {
                        return dishCategoryRepository.findById(catDTO.getIdDishCategory()).orElse(null);
                    }
                    // Si no tiene ID pero tiene nombre, buscar o crear por nombre
                    if (catDTO.getName() != null && !catDTO.getName().trim().isEmpty()) {
                        return dishCategoryRepository.findByName(catDTO.getName())
                            .orElseGet(() -> {
                                DishCategory newCategory = new DishCategory();
                                newCategory.setName(catDTO.getName());
                                return dishCategoryRepository.save(newCategory);
                            });
                    }
                    return null;
                })
                .filter(cat -> cat != null)
                .collect(Collectors.toList());
            dish.setCategories(categories);
        }

        // Actualizar restricciones si se proporcionan
        if (dishDTO.getRestrictions() != null) {
            List<DishRestriction> restrictions = dishDTO.getRestrictions().stream()
                .map(resDTO -> {
                    // Si tiene ID, buscar por ID
                    if (resDTO.getIdRestriction() != null) {
                        return dishRestrictionRepository.findById(resDTO.getIdRestriction()).orElse(null);
                    }
                    // Si no tiene ID pero tiene nombre, buscar o crear por nombre
                    if (resDTO.getName() != null && !resDTO.getName().trim().isEmpty()) {
                        return dishRestrictionRepository.findByName(resDTO.getName())
                            .orElseGet(() -> {
                                DishRestriction newRestriction = new DishRestriction();
                                newRestriction.setName(resDTO.getName());
                                return dishRestrictionRepository.save(newRestriction);
                            });
                    }
                    return null;
                })
                .filter(res -> res != null)
                .collect(Collectors.toList());
            dish.setRestrictions(restrictions);
        }

        // Actualizar ingredientes si se proporcionan
        if (dishDTO.getIngredients() != null) {
            List<Ingredient> ingredients = dishDTO.getIngredients().stream()
                .map(ingDTO -> {
                    // Si tiene ID, buscar por ID
                    if (ingDTO.getIdIngredient() != null) {
                        return ingredientRepository.findById(ingDTO.getIdIngredient()).orElse(null);
                    }
                    // Si no tiene ID pero tiene nombre, buscar o crear por nombre
                    if (ingDTO.getName() != null && !ingDTO.getName().trim().isEmpty()) {
                        return ingredientRepository.findByName(ingDTO.getName())
                            .orElseGet(() -> {
                                Ingredient newIngredient = new Ingredient();
                                newIngredient.setName(ingDTO.getName());
                                return ingredientRepository.save(newIngredient);
                            });
                    }
                    return null;
                })
                .filter(ing -> ing != null)
                .collect(Collectors.toList());
            dish.setIngredients(ingredients);
        }

        Dish updatedDish = dishRepository.save(dish);
        return DishDTO.fromEntity(updatedDish);
    }

    @CacheEvict(value = "menus", allEntries = true)
    @Override
    @Transactional
    public void deleteDish(Long dishId) {
        if (!dishRepository.existsById(dishId)) {
            throw new IllegalArgumentException("No se encontró el plato con ID " + dishId);
        }
        dishRepository.deleteById(dishId);
    }

    @CacheEvict(value = "menus", allEntries = true)
    @Override
    @Transactional
    public DishDTO updateDishAvailability(Long dishId, Boolean available) {
        Dish dish = dishRepository.findById(dishId)
            .orElseThrow(() -> new IllegalArgumentException("No se encontró el plato con ID " + dishId));

        dish.setAvailable(available);
        Dish updatedDish = dishRepository.save(dish);
        return DishDTO.fromEntity(updatedDish);
    }
}
