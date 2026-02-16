package com.tapalque.msvc_reservas.maper.dto;

import com.tapalque.msvc_reservas.dto.CustomerDTO;
import com.tapalque.msvc_reservas.dto.HotelDTO;
import com.tapalque.msvc_reservas.dto.PaymentDTO;
import com.tapalque.msvc_reservas.dto.ReservationDTO;
import com.tapalque.msvc_reservas.dto.StayPeriodDTO;
import com.tapalque.msvc_reservas.entity.Reservation;

public class ReservationMapper {

    public static ReservationDTO toDto(Reservation r) {
        ReservationDTO dto = new ReservationDTO();
        dto.setId(r.getId());
        dto.setCustomer(toDto(r.getCustomer()));
        dto.setHotel(toDto(r.getHotel()));
        dto.setStayPeriod(toDto(r.getStayPeriod()));
        dto.setPayment(toDto(r.getPayment()));
        dto.setTotalPrice(r.getTotalPrice());
        dto.setIsActive(r.getIsActive());
        dto.setIsCancelled(r.getIsCancelled());
        dto.setDateCreated(r.getDateCreated());
        dto.setDateUpdated(r.getDateUpdated());
        dto.setRoomNumber(r.getRoomNumber());
        dto.setNotas(r.getNotas());
        return dto;
    }

    public static CustomerDTO toDto(Reservation.Customer c) {
        if (c == null) return null;
        CustomerDTO dto = new CustomerDTO();
        dto.setCustomerId(c.getCustomerId());
        dto.setCustomerName(c.getCustomerName());
        dto.setCustomerPhone(c.getCustomerPhone());
        dto.setCustomerEmail(c.getCustomerEmail());
        dto.setCustomerDni(c.getCustomerDni());
        return dto;
    }

    public static HotelDTO toDto(Reservation.Hotel h) {
        HotelDTO dto = new HotelDTO();
        dto.setHotelId(h.getHotelId());
        dto.setHotelName(h.getHotelName());
        return dto;
    }

    public static StayPeriodDTO toDto(Reservation.StayPeriod s) {
        if (s == null) return null;
        StayPeriodDTO dto = new StayPeriodDTO();
        dto.setCheckInDate(s.getCheckInDate());
        dto.setCheckOutDate(s.getCheckOutDate());
        return dto;
    }

    public static PaymentDTO toDto(Reservation.Payment p) {
        if (p == null) return null;
        PaymentDTO dto = new PaymentDTO();
        dto.setTotalAmount(p.getTotalAmount());
        dto.setAmountPaid(p.getAmountPaid());
        dto.setRemainingAmount(p.getRemainingAmount());
        dto.setIsPaid(p.getIsPaid());
        dto.setHasPendingAmount(p.getHasPendingAmount());
        dto.setIsDeposit(p.getIsDeposit());
        dto.setPaymentType(p.getPaymentType());
        dto.setPaymentReceiptPath(p.getPaymentReceiptPath());
        return dto;
    }

    public static Reservation toEntity(ReservationDTO dto) {
        Reservation r = new Reservation();
        r.setId(dto.getId());
        r.setCustomer(toEntity(dto.getCustomer()));
        r.setHotel(toEntity(dto.getHotel()));
        r.setStayPeriod(toEntity(dto.getStayPeriod()));
        r.setPayment(toEntity(dto.getPayment()));
        r.setTotalPrice(dto.getTotalPrice());
        r.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        r.setIsCancelled(dto.getIsCancelled() != null ? dto.getIsCancelled() : false);
        r.setDateCreated(dto.getDateCreated());
        r.setDateUpdated(dto.getDateUpdated());
        r.setRoomNumber(dto.getRoomNumber());
        r.setNotas(dto.getNotas());
        return r;
    }

    public static Reservation.Customer toEntity(CustomerDTO dto) {
        if (dto == null) return null;
        Reservation.Customer c = new Reservation.Customer();
        c.setCustomerId(dto.getCustomerId());
        c.setCustomerName(dto.getCustomerName());
        c.setCustomerPhone(dto.getCustomerPhone());
        c.setCustomerEmail(dto.getCustomerEmail());
        c.setCustomerDni(dto.getCustomerDni());
        return c;
    }

    public static Reservation.Hotel toEntity(HotelDTO dto) {
        Reservation.Hotel h = new Reservation.Hotel();
        h.setHotelId(dto.getHotelId());
        h.setHotelName(dto.getHotelName());
        return h;
    }

    public static Reservation.StayPeriod toEntity(StayPeriodDTO dto) {
        if (dto == null) return null;
        Reservation.StayPeriod s = new Reservation.StayPeriod();
        s.setCheckInDate(dto.getCheckInDate());
        s.setCheckOutDate(dto.getCheckOutDate());
        return s;
    }

    public static Reservation.Payment toEntity(PaymentDTO dto) {
        if (dto == null) return null;
        Reservation.Payment p = new Reservation.Payment();
        Double totalAmount = dto.getTotalAmount() != null ? dto.getTotalAmount() : 0.0;
        Double amountPaid = dto.getAmountPaid() != null ? dto.getAmountPaid() : 0.0;
        p.setTotalAmount(totalAmount);
        p.setAmountPaid(amountPaid);
        p.setRemainingAmount(totalAmount - amountPaid);
        p.setIsPaid(p.getRemainingAmount() <= 0);
        p.setHasPendingAmount(p.getRemainingAmount() > 0);
        p.setIsDeposit(dto.getIsDeposit());
        p.setPaymentType(dto.getPaymentType());
        p.setPaymentReceiptPath(dto.getPaymentReceiptPath());
        return p;
    }
}
