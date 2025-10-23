package com.tapalque.gastronomia.demo.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
    
    @Override // Implementación del método para obtener un local gastronómico por su ID
  
    public RestaurantDTO getRestaurantById(Long id) {
    return localGastronomicoRepository.selectRestaurantById(id)
        .orElseThrow(() -> new EntityNotFoundException("Restaurant not found with id: " + id));
}
    @Override // Implementación del método para obtener todos los locales gastronómicos
    public List<RestaurantDTO> getAllLocalGastronomicos() {
        return localGastronomicoRepository.selectAllRestaurant();
        
    }
   @Override //implementacion: busca las categorias en BD y setea los id_category para guardar. Mismo con phone y schedule
public RestaurantDTO addRestaurant(RestaurantDTO dto) {

   Restaurant entity = dto.toEntity();

    if (entity.getCategories() != null && !entity.getCategories().isEmpty()) {
        List<Category> existingCategories = entity.getCategories().stream()
                .map(c -> categoryRepository.findByName(c.getName())
                        .orElseThrow(() -> new RuntimeException("Categoría no encontrada: " + c.getName())))
                .toList();
        entity.setCategories(existingCategories);
    }

    if (entity.getPhoneNumbers() != null) {
        entity.getPhoneNumbers().forEach(p -> p.setRestaurant(entity));
    }
    if (entity.getSchedules() != null) {
        entity.getSchedules().forEach(s -> s.setRestaurant(entity));
    }

    Restaurant savedEntity = localGastronomicoRepository.save(entity);
    return new RestaurantDTO(savedEntity);
}

    @Override
    public void updateRestaurant(Restaurant restaurant) {
        Long id = restaurant.getIdRestaurant();
        if (id == null) {
            throw new EntityNotFoundException("El id del local es nulo");
        }
        if (!localGastronomicoRepository.existsById(id)) {
            throw new EntityNotFoundException("No existe el local con id " + id);
        }
        localGastronomicoRepository.save(restaurant);
    }

    @Override
    public void deleteRestaurant(Long id) {
        Long idLong = (long) id;
        if (!localGastronomicoRepository.existsById(idLong)) {
            throw new EntityNotFoundException("No se puede eliminar, no existe el local con id " + id);
        }
        localGastronomicoRepository.deleteById(idLong);
    }
   


}
