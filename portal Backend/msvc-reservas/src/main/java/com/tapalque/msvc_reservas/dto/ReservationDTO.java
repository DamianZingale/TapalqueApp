package com.tapalque.msvc_reservas.dto;

public class ReservationDTO {
    private String id;
    private CustomerDTO customer;
    private HotelDTO hotel;
    private StayPeriodDTO stayPeriod;
    private PaymentDTO payment;

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
}
