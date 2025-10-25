package com.tapalque.msvc_reservas.dto;

import java.time.LocalDateTime;

public class StayPeriodDTO {
    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;

    public StayPeriodDTO() {}

    public StayPeriodDTO(LocalDateTime checkInDate, LocalDateTime checkOutDate) {
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
