package com.tapalque.msvc_pedidos.dto;

public class DishPriceDTO {
    private Long idDish;
    private Double price;
    private Boolean available;

    public DishPriceDTO() {}

    public Long getIdDish() { return idDish; }
    public void setIdDish(Long idDish) { this.idDish = idDish; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
}
