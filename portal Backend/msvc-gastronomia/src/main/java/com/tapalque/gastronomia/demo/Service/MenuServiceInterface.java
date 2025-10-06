package com.tapalque.gastronomia.demo.Service;

import com.tapalque.gastronomia.demo.DTO.MenuDTO;

public interface MenuServiceInterface {

    public MenuDTO getMenuByRestaurantId(Long idRestaurant);

    
}
