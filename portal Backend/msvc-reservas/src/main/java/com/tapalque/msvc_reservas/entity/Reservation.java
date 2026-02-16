package com.tapalque.msvc_reservas.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.tapalque.msvc_reservas.enums.PaymentType;

@Document(collection = "reservations")
public class Reservation {

    @Id
    private String id;

    private Customer customer;     // Cliente que reserva
    private Hotel hotel;           // Hotel o alojamiento
    private StayPeriod stayPeriod; // Fechas de entrada/salida
    private Payment payment;       // Información de pago

    private Double totalPrice;
    private Boolean isActive;
    private Boolean isCancelled;

    private LocalDateTime dateCreated;
    private LocalDateTime dateUpdated;

    // Información de Mercado Pago
    private Long transaccionId; // ID de la transacción en msvc-mercado-pago
    private String mercadoPagoId; // ID del pago en Mercado Pago
    private LocalDateTime fechaPago; // Fecha en que se aprobó el pago

    // Número de habitación asignada
    private Integer roomNumber;

    // Notas adicionales del administrador
    private String notas;

    public Reservation() {}

    public Reservation(Customer customer, Hotel hotel, StayPeriod stayPeriod, Payment payment, Double totalPrice) {
        this.customer = customer;
        this.hotel = hotel;
        this.stayPeriod = stayPeriod;
        this.payment = payment;
        this.totalPrice = totalPrice;
        this.isActive = true;
        this.isCancelled = false;
        this.dateCreated = LocalDateTime.now();
        this.dateUpdated = LocalDateTime.now();
    }

    // --- Getters and Setters --- //
    public String getId() {
    return id;
}

public void setId(String id) {
    this.id = id;
}

public Customer getCustomer() {
    return customer;
}

public void setCustomer(Customer customer) {
    this.customer = customer;
}

public Hotel getHotel() {
    return hotel;
}

public void setHotel(Hotel hotel) {
    this.hotel = hotel;
}

public StayPeriod getStayPeriod() {
    return stayPeriod;
}

public void setStayPeriod(StayPeriod stayPeriod) {
    this.stayPeriod = stayPeriod;
}

public Payment getPayment() {
    return payment;
}

public void setPayment(Payment payment) {
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

public Long getTransaccionId() {
    return transaccionId;
}

public void setTransaccionId(Long transaccionId) {
    this.transaccionId = transaccionId;
}

public String getMercadoPagoId() {
    return mercadoPagoId;
}

public void setMercadoPagoId(String mercadoPagoId) {
    this.mercadoPagoId = mercadoPagoId;
}

public LocalDateTime getFechaPago() {
    return fechaPago;
}

public void setFechaPago(LocalDateTime fechaPago) {
    this.fechaPago = fechaPago;
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

    // --- Inner classes --- //

    public static class Customer {
        private String customerId;
        private String customerName;
        private String customerPhone;
        private String customerEmail;
        private String customerDni;

        public Customer() {}

        public Customer(String customerId, String customerName) {
            this.customerId = customerId;
            this.customerName = customerName;
        }

        public Customer(String customerId, String customerName, String customerPhone, String customerEmail) {
            this.customerId = customerId;
            this.customerName = customerName;
            this.customerPhone = customerPhone;
            this.customerEmail = customerEmail;
        }

        public Customer(String customerId, String customerName, String customerPhone, String customerEmail, String customerDni) {
            this.customerId = customerId;
            this.customerName = customerName;
            this.customerPhone = customerPhone;
            this.customerEmail = customerEmail;
            this.customerDni = customerDni;
        }

        public String getCustomerId() {
            return customerId;
        }

        public void setCustomerId(String customerId) {
            this.customerId = customerId;
        }

        public String getCustomerName() {
            return customerName;
        }

        public void setCustomerName(String customerName) {
            this.customerName = customerName;
        }

        public String getCustomerPhone() {
            return customerPhone;
        }

        public void setCustomerPhone(String customerPhone) {
            this.customerPhone = customerPhone;
        }

        public String getCustomerEmail() {
            return customerEmail;
        }

        public void setCustomerEmail(String customerEmail) {
            this.customerEmail = customerEmail;
        }

        public String getCustomerDni() {
            return customerDni;
        }

        public void setCustomerDni(String customerDni) {
            this.customerDni = customerDni;
        }
    }

    public static class Hotel {
        private String hotelId;
        private String hotelName;

        public Hotel() {}

        public Hotel(String hotelId, String hotelName) {
            this.hotelId = hotelId;
            this.hotelName = hotelName;
        }

        public String getHotelId() {
            return hotelId;
        }

        public void setHotelId(String hotelId) {
            this.hotelId = hotelId;
        }

        public String getHotelName() {
            return hotelName;
        }

        public void setHotelName(String hotelName) {
            this.hotelName = hotelName;
        }
    }

    public static class StayPeriod {
        private LocalDateTime checkInDate;
        private LocalDateTime checkOutDate;

        public StayPeriod() {}

        public StayPeriod(LocalDateTime checkInDate, LocalDateTime checkOutDate) {
            this.checkInDate = checkInDate;
            this.checkOutDate = checkOutDate;
        }

        public LocalDateTime getCheckInDate() {
            return checkInDate;
        }

        public void setCheckInDate(LocalDateTime checkInDate) {
            this.checkInDate = checkInDate;
        }

        public LocalDateTime getCheckOutDate() {
            return checkOutDate;
        }

        public void setCheckOutDate(LocalDateTime checkOutDate) {
            this.checkOutDate = checkOutDate;
        }
    }
    public static class Payment {

    private Boolean isPaid; // totalmente pagado
    private Boolean hasPendingAmount; // queda saldo pendiente
    private Boolean isDeposit; // seña o pago total
    private PaymentType paymentType; // tipo de pago 
    private String paymentReceiptPath; // comprobante
    private Double amountPaid; // monto abonado
    private Double totalAmount; // total de la reserva
    private Double remainingAmount; // saldo restante

    public Payment() {}

    public Payment(Double totalAmount, Double amountPaid, Boolean isDeposit, PaymentType paymentType) {
        this.totalAmount = totalAmount;
        this.amountPaid = amountPaid;
        this.isDeposit = isDeposit;
        this.paymentType = paymentType;
        this.remainingAmount = totalAmount - amountPaid;
        this.isPaid = remainingAmount <= 0;
        this.hasPendingAmount = remainingAmount > 0;
    }

    public Double getRemainingAmount() {
        return remainingAmount;
    }

    public void setRemainingAmount(Double remainingAmount) {
        this.remainingAmount = remainingAmount;
        this.isPaid = remainingAmount <= 0;
        this.hasPendingAmount = remainingAmount > 0;
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
        this.remainingAmount = this.totalAmount - this.amountPaid;
        this.isPaid = this.remainingAmount <= 0;
        this.hasPendingAmount = this.remainingAmount > 0;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
        if (this.totalAmount != null && this.amountPaid != null) {
            this.remainingAmount = this.totalAmount - this.amountPaid;
        }
    }
}




}