package com.tapalque.gastronomia.demo.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tapalque.gastronomia.demo.DTO.BasicRestaurantDTO;
import com.tapalque.gastronomia.demo.Entity.Restaurant;
import com.tapalque.gastronomia.demo.Repository.RestaurantRepositoryInterface;

import jakarta.persistence.EntityNotFoundException;


@Service
public class RestaurantService implements I_RestaurantService {

    private final RestaurantRepositoryInterface restaurantRepository;

    public RestaurantService(RestaurantRepositoryInterface restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

   
    @Transactional(readOnly = true)
    @Override
    public List<BasicRestaurantDTO> getAllRestaurant() {
    List<Restaurant> locales = restaurantRepository.findAll();
    if (locales == null || locales.isEmpty()) {
        throw new EntityNotFoundException("No se encontraron restaurantes");
    }
    else {
        return locales.stream()
                .map(BasicRestaurantDTO::new)
                .collect(Collectors.toList());
                
    }
}

    

    

   
    
}


