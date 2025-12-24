package com.tapalque.msvc_pedidos.dto;

import java.time.LocalDateTime;
import java.util.List;

public class OrderDTO {
    private String id;
    private Double totalPrice; //precio total del pedido
    private Boolean paidWithMercadoPago; //indica si se pagó con MercadoPago
    private Boolean paidWithCash; //indica si se paga en efectivo
    private String status; //estado del pedido (e.g., "PENDING", "COMPLETED", "CANCELLED")
    private LocalDateTime dateCreated; //fecha y hora de creación del pedido
    private LocalDateTime dateUpdated; //fecha y hora de la última actualización del pedido
    private List<ItemDTO> items; //lista de items en el pedido
    private RestaurantDTO restaurant; //información del restaurante asociado al pedido
    private String paymentReceiptPath; //ruta del comprobante de pago

    
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
}
