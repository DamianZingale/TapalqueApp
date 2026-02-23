package com.tapalque.msvc_reservas.dto;

import java.time.LocalDateTime;

import com.tapalque.msvc_reservas.enums.PaymentType;

public class PaymentRecordDTO {
    private LocalDateTime date;
    private Double amount;
    private PaymentType paymentType;
    private String description;

    public PaymentRecordDTO() {}

    public PaymentRecordDTO(LocalDateTime date, Double amount, PaymentType paymentType, String description) {
        this.date = date;
        this.amount = amount;
        this.paymentType = paymentType;
        this.description = description;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public PaymentType getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(PaymentType paymentType) {
        this.paymentType = paymentType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
