package com.tapalque.msvc_pedidos.dto;

import java.time.LocalDateTime;
import java.util.List;

public class OrderDTO {
    private String id;
    private String userId;
    private String userName;
    private String userPhone;
    private Double totalPrice;
    private Boolean paidWithMercadoPago;
    private Boolean paidWithCash;
    private String status;
    private LocalDateTime dateCreated;
    private LocalDateTime dateUpdated;
    private List<ItemDTO> items;
    private RestaurantDTO restaurant;
    private String paymentReceiptPath;
    private Boolean isDelivery;
    private String deliveryAddress;

    
    public OrderDTO() {}

    // getters y setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public Boolean getPaidWithMercadoPago() { return paidWithMercadoPago; }
    public void setPaidWithMercadoPago(Boolean paidWithMercadoPago) { this.paidWithMercadoPago = paidWithMercadoPago; }

    public Boolean getPaidWithCash() { return paidWithCash; }
    public void setPaidWithCash(Boolean paidWithCash) { this.paidWithCash = paidWithCash; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }

    public LocalDateTime getDateUpdated() { return dateUpdated; }
    public void setDateUpdated(LocalDateTime dateUpdated) { this.dateUpdated = dateUpdated; }

    public List<ItemDTO> getItems() { return items; }
    public void setItems(List<ItemDTO> items) { this.items = items; }

    public RestaurantDTO getRestaurant() { return restaurant; }
    public void setRestaurant(RestaurantDTO restaurant) { this.restaurant = restaurant; }

    public String getPaymentReceiptPath() {
        return paymentReceiptPath;
    }

    public void setPaymentReceiptPath(String paymentReceiptPath) {
        this.paymentReceiptPath = paymentReceiptPath;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserPhone() { return userPhone; }
    public void setUserPhone(String userPhone) { this.userPhone = userPhone; }

    public Boolean getIsDelivery() { return isDelivery; }
    public void setIsDelivery(Boolean isDelivery) { this.isDelivery = isDelivery; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
}
