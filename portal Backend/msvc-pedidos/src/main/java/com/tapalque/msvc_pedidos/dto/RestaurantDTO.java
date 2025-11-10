package com.tapalque.msvc_pedidos.dto;

public class RestaurantDTO {
    private String restaurantId;
    private String restaurantName;

    public RestaurantDTO() {}

    // getters y setters
    public String getRestaurantId() { return restaurantId; }
    public void setRestaurantId(String restaurantId) { this.restaurantId = restaurantId; }

    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }
}
