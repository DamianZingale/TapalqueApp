package com.tapalque.msvc_pedidos.dto;

public class ItemDTO {
    private String productId;
    private String itemName;
    private Double itemPrice;
    private Integer itemQuantity;

    public ItemDTO() {}

    // getters y setters
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public Double getItemPrice() { return itemPrice; }
    public void setItemPrice(Double itemPrice) { this.itemPrice = itemPrice; }

    public Integer getItemQuantity() { return itemQuantity; }
    public void setItemQuantity(Integer itemQuantity) { this.itemQuantity = itemQuantity; }
}