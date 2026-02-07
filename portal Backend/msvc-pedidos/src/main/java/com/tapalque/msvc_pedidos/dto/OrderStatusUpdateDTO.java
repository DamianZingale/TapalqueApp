package com.tapalque.msvc_pedidos.dto;

public class OrderStatusUpdateDTO {
    private String status;

    public OrderStatusUpdateDTO() {}

    public OrderStatusUpdateDTO(String status) {
        this.status = status;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
