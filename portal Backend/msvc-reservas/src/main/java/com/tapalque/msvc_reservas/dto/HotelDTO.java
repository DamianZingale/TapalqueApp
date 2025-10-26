package com.tapalque.msvc_reservas.dto;

public class HotelDTO {
    private String hotelId;
    private String hotelName;

    public HotelDTO() {}

    public HotelDTO(String hotelId, String hotelName) {
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
