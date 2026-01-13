package com.tapalque.user.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.tapalque.user.dto.BusinessDTO;
import com.tapalque.user.repository.BusinessRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessRepository businessRepository;

    /**
     * Obtiene todos los negocios de un usuario (administrador)
     */
    public List<BusinessDTO> getBusinessesByUserId(Long userId) {
        return businessRepository.findByOwnerId(userId)
                .stream()
                .map(BusinessDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un negocio por ID
     */
    public BusinessDTO getBusinessById(Long businessId) {
        return businessRepository.findById(businessId)
                .map(BusinessDTO::fromEntity)
                .orElse(null);
    }
}
