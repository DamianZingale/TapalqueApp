package com.tapalque.msvc_reservas.maper.dto;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import com.tapalque.msvc_reservas.dto.CustomerDTO;
import com.tapalque.msvc_reservas.dto.HotelDTO;
import com.tapalque.msvc_reservas.dto.PaymentDTO;
import com.tapalque.msvc_reservas.dto.PaymentRecordDTO;
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
        dto.setCantidadHuespedes(r.getCantidadHuespedes());
        dto.setRequiereFacturacion(r.getRequiereFacturacion());
        dto.setBillingInfo(toDto(r.getBillingInfo()));
        dto.setPaymentHistory(toDtoPaymentHistory(r.getPaymentHistory()));
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

    public static com.tapalque.msvc_reservas.dto.BillingInfoDTO toDto(Reservation.BillingInfo b) {
        if (b == null) return null;
        com.tapalque.msvc_reservas.dto.BillingInfoDTO dto = new com.tapalque.msvc_reservas.dto.BillingInfoDTO();
        dto.setCuitCuil(b.getCuitCuil());
        dto.setRazonSocial(b.getRazonSocial());
        dto.setDomicilioComercial(b.getDomicilioComercial());
        dto.setTipoFactura(b.getTipoFactura());
        dto.setCondicionFiscal(b.getCondicionFiscal());
        return dto;
    }

    public static PaymentRecordDTO toDto(Reservation.PaymentRecord pr) {
        if (pr == null) return null;
        PaymentRecordDTO dto = new PaymentRecordDTO();
        dto.setDate(pr.getDate());
        dto.setAmount(pr.getAmount());
        dto.setPaymentType(pr.getPaymentType());
        dto.setDescription(pr.getDescription());
        return dto;
    }

    public static List<PaymentRecordDTO> toDtoPaymentHistory(List<Reservation.PaymentRecord> records) {
        if (records == null) return Collections.emptyList();
        return records.stream().map(ReservationMapper::toDto).collect(Collectors.toList());
    }

    public static Reservation.PaymentRecord toEntity(PaymentRecordDTO dto) {
        if (dto == null) return null;
        Reservation.PaymentRecord pr = new Reservation.PaymentRecord();
        pr.setDate(dto.getDate());
        pr.setAmount(dto.getAmount());
        pr.setPaymentType(dto.getPaymentType());
        pr.setDescription(dto.getDescription());
        return pr;
    }

    public static List<Reservation.PaymentRecord> toEntityPaymentHistory(List<PaymentRecordDTO> dtos) {
        if (dtos == null) return Collections.emptyList();
        return dtos.stream().map(ReservationMapper::toEntity).collect(Collectors.toList());
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
        r.setCantidadHuespedes(dto.getCantidadHuespedes());
        r.setRequiereFacturacion(dto.getRequiereFacturacion());
        r.setBillingInfo(toEntity(dto.getBillingInfo()));
        r.setPaymentHistory(toEntityPaymentHistory(dto.getPaymentHistory()));
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

    public static Reservation.BillingInfo toEntity(com.tapalque.msvc_reservas.dto.BillingInfoDTO dto) {
        if (dto == null) return null;
        Reservation.BillingInfo b = new Reservation.BillingInfo();
        b.setCuitCuil(dto.getCuitCuil());
        b.setRazonSocial(dto.getRazonSocial());
        b.setDomicilioComercial(dto.getDomicilioComercial());
        b.setTipoFactura(dto.getTipoFactura());
        b.setCondicionFiscal(dto.getCondicionFiscal());
        return b;
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
