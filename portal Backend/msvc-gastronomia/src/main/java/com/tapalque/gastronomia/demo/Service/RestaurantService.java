package com.tapalque.gastronomia.demo.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import com.tapalque.gastronomia.demo.DTO.RestaurantDTO;
import com.tapalque.gastronomia.demo.Entity.Category;
import com.tapalque.gastronomia.demo.Entity.Restaurant;
import com.tapalque.gastronomia.demo.Repository.CategoryRepositoriInterface;
import com.tapalque.gastronomia.demo.Repository.LocalRepositoryInterface;

import jakarta.persistence.EntityNotFoundException;

@Service
public class RestaurantService implements I_RestaurantService {

    @Autowired
    private LocalRepositoryInterface localGastronomicoRepository;
    
    @Autowired
    private CategoryRepositoriInterface categoryRepository;
    
    @Cacheable(value = "restaurante", key = "#id")
    @Override // Implementación del método para obtener un local gastronómico por su ID

    public RestaurantDTO getRestaurantById(Long id) {
    try {
        System.out.println("Buscando restaurant con ID: " + id);
        return localGastronomicoRepository.selectRestaurantById(id)
            .orElseThrow(() -> new EntityNotFoundException("Restaurant not found with id: " + id));
    } catch (EntityNotFoundException e) {
        throw e;
    } catch (Exception e) {
        System.err.println("Error en consulta SQL para restaurant ID " + id + ": " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Error al obtener restaurant: " + e.getMessage(), e);
    }
}
    @Cacheable(value = "restaurantes")
    @Override // Implementación del método para obtener todos los locales gastronómicos
    public List<RestaurantDTO> getAllLocalGastronomicos() {
        return localGastronomicoRepository.selectAllRestaurant();
        
    }
   @CacheEvict(value = "restaurantes", allEntries = true)
   @Override //implementacion: busca las categorias en BD y setea los id_category para guardar. Mismo con phone y schedule
public RestaurantDTO addRestaurant(RestaurantDTO dto) {
    try {
        System.out.println("Guardando restaurant: " + dto.getName());
        Restaurant entity = dto.toEntity();

        // Manejar categorías: buscar las existentes o limpiar si no se encuentran
        if (entity.getCategories() != null && !entity.getCategories().isEmpty()) {
            System.out.println("Procesando categorías...");
            List<Category> existingCategories = entity.getCategories().stream()
                    .map(c -> {
                        System.out.println("Buscando categoría: " + c.getName());
                        return categoryRepository.findByName(c.getName())
                                .orElseGet(() -> {
                                    System.err.println("ADVERTENCIA: Categoría no encontrada: " + c.getName());
                                    return null;
                                });
                    })
                    .filter(c -> c != null) // Filtrar las que no se encontraron
                    .toList();

            entity.setCategories(existingCategories);
            System.out.println("Categorías procesadas: " + existingCategories.size());
        } else {
            System.out.println("Sin categorías para procesar");
            entity.setCategories(null);
        }

        if (entity.getPhoneNumbers() != null) {
            entity.getPhoneNumbers().forEach(p -> p.setRestaurant(entity));
        }
        if (entity.getSchedules() != null) {
            entity.getSchedules().forEach(s -> s.setRestaurant(entity));
        }

        Restaurant savedEntity = localGastronomicoRepository.save(entity);
        System.out.println("Restaurant guardado exitosamente con ID: " + savedEntity.getIdRestaurant());
        return new RestaurantDTO(savedEntity);
    } catch (Exception e) {
        System.err.println("Error al guardar restaurant: " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Error al guardar restaurant: " + e.getMessage(), e);
    }
}

    @Caching(evict = {@CacheEvict(value = "restaurantes", allEntries = true), @CacheEvict(value = "restaurante", allEntries = true)})
    @Override
    public void updateRestaurant(Restaurant restaurant) {
        try {
            Long id = restaurant.getIdRestaurant();
            if (id == null) {
                throw new EntityNotFoundException("El id del local es nulo");
            }
            if (!localGastronomicoRepository.existsById(id)) {
                throw new EntityNotFoundException("No existe el local con id " + id);
            }

            System.out.println("Actualizando restaurant ID: " + id);

            // Manejar categorías: buscar las existentes o limpiar si no se encuentran
            if (restaurant.getCategories() != null && !restaurant.getCategories().isEmpty()) {
                System.out.println("Procesando categorías para actualización...");
                List<Category> existingCategories = restaurant.getCategories().stream()
                        .map(c -> {
                            System.out.println("Buscando categoría: " + c.getName());
                            return categoryRepository.findByName(c.getName())
                                    .orElseGet(() -> {
                                        System.err.println("ADVERTENCIA: Categoría no encontrada: " + c.getName());
                                        return null;
                                    });
                        })
                        .filter(c -> c != null) // Filtrar las que no se encontraron
                        .toList();

                restaurant.setCategories(existingCategories);
                System.out.println("Categorías procesadas: " + existingCategories.size());
            } else {
                System.out.println("Sin categorías para procesar");
                restaurant.setCategories(null);
            }

            localGastronomicoRepository.save(restaurant);
            System.out.println("Restaurant actualizado exitosamente");
        } catch (EntityNotFoundException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error al actualizar restaurant: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al actualizar restaurant: " + e.getMessage(), e);
        }
    }

    @Caching(evict = {@CacheEvict(value = "restaurantes", allEntries = true), @CacheEvict(value = "restaurante", allEntries = true)})
    @Override
    public void deleteRestaurant(Long id) {
        Long idLong = (long) id;
        if (!localGastronomicoRepository.existsById(idLong)) {
            throw new EntityNotFoundException("No se puede eliminar, no existe el local con id " + id);
        }
        localGastronomicoRepository.deleteById(idLong);
    }
   


}
