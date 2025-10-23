package com.tapalque.msvc_pedidos.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "orders")
public class Order {

    @Id
    private String id;
    private Double totalPrice;
    private Boolean paidWithMercadoPago;
    private Boolean paidWithCash;
    private OrderStatus status;
    private LocalDateTime dateCreated;
    private LocalDateTime dateUpdated;
    private List<Item> items;
    private Restaurant restaurant;

    // --- Constructores ---
    public Order() {
        this.status = OrderStatus.PENDING;
        this.dateCreated = LocalDateTime.now();
        this.dateUpdated = LocalDateTime.now();
    }

    public Order(String id, Double totalPrice, Boolean paidWithMercadoPago, Boolean paidWithCash,
                 List<Item> items, Restaurant restaurant) {
        this.id = id;
        this.totalPrice = totalPrice;
        this.paidWithMercadoPago = paidWithMercadoPago;
        this.paidWithCash = paidWithCash;
        this.status = OrderStatus.PENDING;
        this.items = items;
        this.restaurant = restaurant;
        this.dateCreated = LocalDateTime.now();
        this.dateUpdated = LocalDateTime.now();
    }

    // --- Getters y Setters ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public Boolean getPaidWithMercadoPago() { return paidWithMercadoPago; }
    public void setPaidWithMercadoPago(Boolean paidWithMercadoPago) { this.paidWithMercadoPago = paidWithMercadoPago; }

    public Boolean getPaidWithCash() { return paidWithCash; }
    public void setPaidWithCash(Boolean paidWithCash) { this.paidWithCash = paidWithCash; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }

    public LocalDateTime getDateUpdated() { return dateUpdated; }
    public void setDateUpdated(LocalDateTime dateUpdated) { this.dateUpdated = dateUpdated; }

    public List<Item> getItems() { return items; }
    public void setItems(List<Item> items) { this.items = items; }

    public Restaurant getRestaurant() { return restaurant; }
    public void setRestaurant(Restaurant restaurant) { this.restaurant = restaurant; }

    // --- Clases internas ---
    public static class Item {
        private String productId;
        private String itemName;
        private Double itemPrice;
        private Integer itemQuantity;

        public Item() {}
        public Item(String productId, String itemName, Double itemPrice, Integer itemQuantity) {
            this.productId = productId;
            this.itemName = itemName;
            this.itemPrice = itemPrice;
            this.itemQuantity = itemQuantity;
        }

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }

        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }

        public Double getItemPrice() { return itemPrice; }
        public void setItemPrice(Double itemPrice) { this.itemPrice = itemPrice; }

        public Integer getItemQuantity() { return itemQuantity; }
        public void setItemQuantity(Integer itemQuantity) { this.itemQuantity = itemQuantity; }
    }

    public static class Restaurant {
        private String restaurantId;
        private String restaurantName;

        public Restaurant() {}
        public Restaurant(String restaurantId, String restaurantName) {
            this.restaurantId = restaurantId;
            this.restaurantName = restaurantName;
        }

        public String getRestaurantId() { return restaurantId; }
        public void setRestaurantId(String restaurantId) { this.restaurantId = restaurantId; }

        public String getRestaurantName() { return restaurantName; }
        public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }
    }

    // --- Enum para status ---
    public enum OrderStatus {
        PENDING,
        PAID,
        READY,
        DELIVERED
    }
}
