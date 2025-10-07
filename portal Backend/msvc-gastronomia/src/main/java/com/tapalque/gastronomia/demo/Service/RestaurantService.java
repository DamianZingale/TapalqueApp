package com.tapalque.gastronomia.demo.Service;

import java.util.List;
import java.util.stream.Collectors;

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
public RestaurantDTO getLocalGastronomicoById(Long id) {
    Object resultObj = localGastronomicoRepository.selectRestaurantById(id);
    if (resultObj == null) {
        throw new EntityNotFoundException("No existe el local con id " + id);
    }

    Object[] result = (Object[]) resultObj; 
    
    return new RestaurantDTO(
        ((Number) result[0]).longValue(), // id_restaurant
        (String) result[1],               // name
        (String) result[2],               // address
        (String) result[3],               // email
        (String) result[4],               // map_url
        (String) result[5],               // categories
        (String) result[6],               // phones
        (String) result[7]                // schedule
    );
}

    @Override // Implementación del método para obtener todos los locales gastronómicos
    public List<RestaurantDTO> getAllLocalGastronomicos() {
        List<Object[]> results = localGastronomicoRepository.selectAllRestaurant();
        List<RestaurantDTO> dtos = results.stream()
            .map(r -> new RestaurantDTO(
                ((Number) r[0]).longValue(), // id_restaurant
                (String) r[1],               // name
                (String) r[2],               // address
                (String) r[3],               // email
                (String) r[4],               // map_url
                (String) r[5],               // categories concatenadas
                (String) r[6],               // phones concatenados
                (String) r[7]                // schedule concatenado
            ))
            .collect(Collectors.toList());

    return dtos;
    }
   @Override
public RestaurantDTO addRestaurant(RestaurantDTO dto) {

    // Convertís el DTO a entidad
    Restaurant entity = dto.toEntity();

    // ✅ Buscar categorías existentes por nombre y reemplazarlas
    if (entity.getCategories() != null && !entity.getCategories().isEmpty()) {
        List<Category> existingCategories = entity.getCategories().stream()
                .map(c -> categoryRepository.findByName(c.getName())
                        .orElseThrow(() -> new RuntimeException("Categoría no encontrada: " + c.getName())))
                .toList();
        entity.setCategories(existingCategories);
    }

    // ✅ Setear relación inversa en PhoneNumber y Schedule
    if (entity.getPhoneNumbers() != null) {
        entity.getPhoneNumbers().forEach(p -> p.setRestaurant(entity));
    }
    if (entity.getSchedules() != null) {
        entity.getSchedules().forEach(s -> s.setRestaurant(entity));
    }

    // ✅ Guardar restaurante con todo vinculado correctamente
    Restaurant savedEntity = localGastronomicoRepository.save(entity);
    return new RestaurantDTO(savedEntity);
}

    @Override
    public void updateRestaurant(Restaurant restaurant) {
        if (!localGastronomicoRepository.existsById(restaurant.getIdRestaurant())) {
            throw new EntityNotFoundException("No existe el local con id " + restaurant.getIdRestaurant());
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
