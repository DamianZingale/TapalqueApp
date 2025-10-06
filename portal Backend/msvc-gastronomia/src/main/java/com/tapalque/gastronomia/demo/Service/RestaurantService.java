package com.tapalque.gastronomia.demo.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tapalque.gastronomia.demo.DTO.RestaurantDTO;
import com.tapalque.gastronomia.demo.Entity.Restaurant;
import com.tapalque.gastronomia.demo.Repository.LocalRepositoryInterface;

import jakarta.persistence.EntityNotFoundException;

@Service
public class RestaurantService implements I_RestaurantService {

    @Autowired
    private LocalRepositoryInterface localGastronomicoRepository;

    @Override
    public void addLocalGastronomico(Restaurant localGastronomico) {
        if (localGastronomico.getName() == null || localGastronomico.getName().isBlank()) {
            throw new IllegalArgumentException("El nombre del local no puede estar vacío");
        }
        localGastronomicoRepository.save(localGastronomico);
    }

    @Override
    public Restaurant getLocalGastronomicoById(Long id) {
        return localGastronomicoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el local con id " + id));
    }

    @Override
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
    
    @Override
    public List<Restaurant> findByCategories(String category) {
        return localGastronomicoRepository.findByCategoryName(category);
    }

}
