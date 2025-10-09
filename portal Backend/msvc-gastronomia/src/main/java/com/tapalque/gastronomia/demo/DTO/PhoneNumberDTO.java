package com.tapalque.gastronomia.demo.DTO;

import com.tapalque.gastronomia.demo.Entity.PhoneNumber;
import com.tapalque.gastronomia.demo.Entity.PhoneType;

public class PhoneNumberDTO {
    private Long idPhoneNumber;
    private String number;
    private PhoneType type;

    public PhoneNumberDTO() {}

    public PhoneNumberDTO(PhoneNumber phoneNumber) {
        this.idPhoneNumber = phoneNumber.getIdPhoneNumber();
        this.number = phoneNumber.getNumber();
        this.type = phoneNumber.getType();
    }

    public PhoneNumber toEntity() {
        PhoneNumber p = new PhoneNumber();
        p.setIdPhoneNumber(this.idPhoneNumber);
        p.setNumber(this.number);
        p.setType(this.type);
        return p;
    }

    public Long getIdPhoneNumber() {
        return idPhoneNumber;
    }

    public void setIdPhoneNumber(Long idPhoneNumber) {
        this.idPhoneNumber = idPhoneNumber;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public PhoneType getType() {
        return type;
    }

    public void setType(PhoneType type) {
        this.type = type;
    }

    

    
}
