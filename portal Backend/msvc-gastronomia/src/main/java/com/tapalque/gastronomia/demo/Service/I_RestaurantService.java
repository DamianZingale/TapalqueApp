package com.tapalque.gastronomia.demo.Service;

import java.util.List;

import com.tapalque.gastronomia.demo.DTO.RestaurantDTO;
import com.tapalque.gastronomia.demo.Entity.Restaurant;

public interface I_RestaurantService {

    
    List<RestaurantDTO> getAllLocalGastronomicos();
    List<RestaurantDTO> getAllLocalGastronomicosAdmin();
    RestaurantDTO getRestaurantById(Long id);
    RestaurantDTO addRestaurant(RestaurantDTO dto);
    void updateRestaurant (Restaurant restaurant);
    RestaurantDTO updateDeliveryPrice(Long id, Double deliveryPrice);
    RestaurantDTO updateLastCloseDate(Long id, java.time.LocalDateTime lastCloseDate);
    RestaurantDTO updateEstimatedWaitTime(Long id, Integer estimatedWaitTime);
    RestaurantDTO toggleActivo(Long id, Boolean activo);
    void deleteRestaurant (Long id);
    
    

   
}


