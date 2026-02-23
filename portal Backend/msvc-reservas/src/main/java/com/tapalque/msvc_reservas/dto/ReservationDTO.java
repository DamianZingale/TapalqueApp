package com.tapalque.msvc_reservas.dto;

import java.time.LocalDateTime;

public class ReservationDTO {
    private String id;
    private CustomerDTO customer;
    private HotelDTO hotel;
    private StayPeriodDTO stayPeriod;
    private PaymentDTO payment;
    private Double totalPrice;
    private Boolean isActive;
    private Boolean isCancelled;
    private LocalDateTime dateCreated;
    private LocalDateTime dateUpdated;
    private Integer roomNumber;
    private String notas;
    private Integer cantidadHuespedes;
    private Boolean requiereFacturacion;
    private BillingInfoDTO billingInfo;

    public ReservationDTO() {}

    public ReservationDTO(String id, CustomerDTO customer, HotelDTO hotel, StayPeriodDTO stayPeriod, PaymentDTO payment) {
        this.id = id;
        this.customer = customer;
        this.hotel = hotel;
        this.stayPeriod = stayPeriod;
        this.payment = payment;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public CustomerDTO getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerDTO customer) {
        this.customer = customer;
    }

    public HotelDTO getHotel() {
        return hotel;
    }

    public void setHotel(HotelDTO hotel) {
        this.hotel = hotel;
    }

    public StayPeriodDTO getStayPeriod() {
        return stayPeriod;
    }

    public void setStayPeriod(StayPeriodDTO stayPeriod) {
        this.stayPeriod = stayPeriod;
    }

    public PaymentDTO getPayment() {
        return payment;
    }

    public void setPayment(PaymentDTO payment) {
        this.payment = payment;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsCancelled() {
        return isCancelled;
    }

    public void setIsCancelled(Boolean isCancelled) {
        this.isCancelled = isCancelled;
    }

    public LocalDateTime getDateCreated() {
        return dateCreated;
    }

    public void setDateCreated(LocalDateTime dateCreated) {
        this.dateCreated = dateCreated;
    }

    public LocalDateTime getDateUpdated() {
        return dateUpdated;
    }

    public void setDateUpdated(LocalDateTime dateUpdated) {
        this.dateUpdated = dateUpdated;
    }

    public Integer getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(Integer roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }

    public Integer getCantidadHuespedes() {
        return cantidadHuespedes;
    }

    public void setCantidadHuespedes(Integer cantidadHuespedes) {
        this.cantidadHuespedes = cantidadHuespedes;
    }

    public Boolean getRequiereFacturacion() {
        return requiereFacturacion;
    }

    public void setRequiereFacturacion(Boolean requiereFacturacion) {
        this.requiereFacturacion = requiereFacturacion;
    }

    public BillingInfoDTO getBillingInfo() {
        return billingInfo;
    }

    public void setBillingInfo(BillingInfoDTO billingInfo) {
        this.billingInfo = billingInfo;
    }
}
