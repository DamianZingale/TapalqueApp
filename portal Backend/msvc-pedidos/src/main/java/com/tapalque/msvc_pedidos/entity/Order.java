package com.tapalque.msvc_pedidos.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;



@Document (collection = "orders")
public class Order {

    @Id
    private String id;
    private Double total_price;
    private Boolean is_active;
    private Boolean is_paid;
    private Boolean is_delivered;
    private List<item> items;
    private LocalDateTime date_created;
    private LocalDateTime date_updated;

    
    public Order() {
    }


    public Order(String id, Double total_price, Boolean is_active, Boolean is_paid, Boolean is_delivered,
            List<item> items) {
        this.id = id;
        this.total_price = total_price;
        this.is_active = is_active;
        this.is_paid = is_paid;
        this.is_delivered = is_delivered;
        this.items = items;
    }


    public String getId() {
        return id;
    }


    public void setId(String id) {
        this.id = id;
    }


    public Double getTotal_price() {
        return total_price;
    }


    public void setTotal_price(Double total_price) {
        this.total_price = total_price;
    }


    public Boolean getIs_active() {
        return is_active;
    }


    public void setIs_active(Boolean is_active) {
        this.is_active = is_active;
    }


    public Boolean getIs_paid() {
        return is_paid;
    }


    public void setIs_paid(Boolean is_paid) {
        this.is_paid = is_paid;
    }


    public Boolean getIs_delivered() {
        return is_delivered;
    }


    public void setIs_delivered(Boolean is_delivered) {
        this.is_delivered = is_delivered;
    }


    public List<item> getItems() {
        return items;
    }


    public void setItems(List<item> items) {
        this.items = items;
    }


    public LocalDateTime getDate_created() {
        return date_created;
    }


    public void setDate_created(LocalDateTime date_created) {
        this.date_created = date_created;
    }


    public LocalDateTime getDate_updated() {
        return date_updated;
    }


    public void setDate_updated(LocalDateTime date_updated) {
        this.date_updated = date_updated;
    }
   
    
    public static class item {

    String product_id;
    String item_name;
    Double item_price;
    Integer item_quantity;
    public item() {
    }
    public item(String product_id, String item_name, Double item_price, Integer item_quantity) {
        this.product_id = product_id;
        this.item_name = item_name;
        this.item_price = item_price;
        this.item_quantity = item_quantity;
    }
    public String getProduct_id() {
        return product_id;
    }
    public void setProduct_id(String product_id) {
        this.product_id = product_id;
    }
    public String getItem_name() {
        return item_name;
    }
    public void setItem_name(String item_name) {
        this.item_name = item_name;
    }
    public Double getItem_price() {
        return item_price;
    }
    public void setItem_price(Double item_price) {
        this.item_price = item_price;
    }
    public Integer getItem_quantity() {
        return item_quantity;
    }
    public void setItem_quantity(Integer item_quantity) {
        this.item_quantity = item_quantity;
    }
    
    }
}
