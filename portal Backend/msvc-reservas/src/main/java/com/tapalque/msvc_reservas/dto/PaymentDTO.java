package com.tapalque.msvc_reservas.dto;

import com.tapalque.msvc_reservas.enums.PaymentType;

public class PaymentDTO {

    private Boolean isPaid;
    private Boolean hasPendingAmount;
    private Boolean isDeposit;
    private PaymentType paymentType;
    private String paymentReceiptPath;
    private Double amountPaid;
    private Double totalAmount;
    private Double remainingAmount;

    public PaymentDTO() {}

    public PaymentDTO(Boolean isPaid, Boolean hasPendingAmount, Boolean isDeposit, PaymentType paymentType,
                      String paymentReceiptPath, Double amountPaid, Double totalAmount, Double remainingAmount) {
        this.isPaid = isPaid;
        this.hasPendingAmount = hasPendingAmount;
        this.isDeposit = isDeposit;
        this.paymentType = paymentType;
        this.paymentReceiptPath = paymentReceiptPath;
        this.amountPaid = amountPaid;
        this.totalAmount = totalAmount;
        this.remainingAmount = remainingAmount;
    }

    public Boolean getIsPaid() {
        return isPaid;
    }

    public void setIsPaid(Boolean isPaid) {
        this.isPaid = isPaid;
    }

    public Boolean getHasPendingAmount() {
        return hasPendingAmount;
    }

    public void setHasPendingAmount(Boolean hasPendingAmount) {
        this.hasPendingAmount = hasPendingAmount;
    }

    public Boolean getIsDeposit() {
        return isDeposit;
    }

    public void setIsDeposit(Boolean isDeposit) {
        this.isDeposit = isDeposit;
    }

    public PaymentType getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(PaymentType paymentType) {
        this.paymentType = paymentType;
    }

    public String getPaymentReceiptPath() {
        return paymentReceiptPath;
    }

    public void setPaymentReceiptPath(String paymentReceiptPath) {
        this.paymentReceiptPath = paymentReceiptPath;
    }

    public Double getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(Double amountPaid) {
        this.amountPaid = amountPaid;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Double getRemainingAmount() {
        return remainingAmount;
    }

    public void setRemainingAmount(Double remainingAmount) {
        this.remainingAmount = remainingAmount;
    }

    
}
