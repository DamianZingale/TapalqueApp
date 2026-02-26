package com.tapalque.gastronomia.demo.Service;

import java.util.List;

import com.tapalque.gastronomia.demo.DTO.RestaurantDTO;
import com.tapalque.gastronomia.demo.Entity.Restaurant;

public interface I_RestaurantService {

    
    List<RestaurantDTO> getAllLocalGastronomicos();
    RestaurantDTO getRestaurantById(Long id);
    RestaurantDTO addRestaurant(RestaurantDTO dto);
    void updateRestaurant (Restaurant restaurant);
    RestaurantDTO updateDeliveryPrice(Long id, Double deliveryPrice);
    RestaurantDTO updateLastCloseDate(Long id, java.time.LocalDateTime lastCloseDate);
    RestaurantDTO updateEstimatedWaitTime(Long id, Integer estimatedWaitTime);
    void deleteRestaurant (Long id);
    RestaurantDTO updateWhatsappConfig(Long id, String whatsappNotificacion, Boolean whatsappActivo);
    
    

   
}


