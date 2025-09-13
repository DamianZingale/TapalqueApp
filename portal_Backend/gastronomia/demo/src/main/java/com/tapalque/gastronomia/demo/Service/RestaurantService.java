package com.tapalque.gastronomia.demo.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tapalque.gastronomia.demo.Entity.Restaurant;
import com.tapalque.gastronomia.demo.Repository.RestaurantRepositoryInterface;

import jakarta.persistence.EntityNotFoundException;

@Service
public class RestaurantService implements I_RestaurantService {

    private final RestaurantRepositoryInterface restaurantRepository;

    public RestaurantService(RestaurantRepositoryInterface restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

   
   @Override
public List<Restaurant> getAllRestaurant() {
    List<Restaurant> locales = restaurantRepository.findAllRestaurantOnly();
    if (locales == null || locales.isEmpty()) {
        throw new EntityNotFoundException("No se encontraron restaurantes");
    }
    return locales;
}

    @Override
    public Restaurant getRestaurantById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Restaurante no encontrado con id: " + id)); 
    }

    @Override
    public Restaurant getRestaurantByCategory(String category) {
        return restaurantRepository.findByCategory(category)
                .orElseThrow(() -> new EntityNotFoundException("Restaurante no encontrado con categoria: " + category));    
    }

   
    
}


