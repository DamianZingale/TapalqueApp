package com.tapalque.user.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.tapalque.user.dto.BusinessDTO;
import com.tapalque.user.dto.BusinessRequestDTO;
import com.tapalque.user.entity.Business;
import com.tapalque.user.entity.User;
import com.tapalque.user.enu.RolName;
import com.tapalque.user.repository.BusinessRepository;
import com.tapalque.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;

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

    /**
     * Obtiene un negocio por externalBusinessId y businessType
     */
    public BusinessDTO getBusinessByExternalIdAndType(Long externalBusinessId, String businessType) {
        try {
            com.tapalque.user.enu.BusinessType type = com.tapalque.user.enu.BusinessType.valueOf(businessType);
            return businessRepository.findByExternalBusinessIdAndBusinessType(externalBusinessId, type)
                    .map(BusinessDTO::fromEntity)
                    .orElse(null);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    // ==================== MODERADOR METHODS ====================

    /**
     * Obtener todos los negocios del sistema
     */
    public List<BusinessDTO> getAllBusinesses() {
        return businessRepository.findAll()
                .stream()
                .map(BusinessDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Asignar un negocio a un administrador
     * Valida que el usuario tenga rol ADMINISTRADOR
     */
    public BusinessDTO assignBusinessToAdmin(BusinessRequestDTO dto) {
        // Validar que el usuario existe y tiene rol ADMINISTRADOR
        User owner = userRepository.findById(dto.getOwnerId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (owner.getRole().getName() != RolName.ADMINISTRADOR) {
            throw new IllegalArgumentException("El usuario debe tener rol ADMINISTRADOR para gestionar negocios");
        }

        // Validar que no exista ya esta asignación
        boolean exists = businessRepository.existsByOwnerIdAndBusinessTypeAndExternalBusinessId(
                dto.getOwnerId(), dto.getBusinessType(), dto.getExternalBusinessId());

        if (exists) {
            throw new IllegalArgumentException("Este negocio ya está asignado al administrador");
        }

        // Crear la asignación
        Business business = new Business();
        business.setOwner(owner);
        business.setName(dto.getName());
        business.setBusinessType(dto.getBusinessType());
        business.setExternalBusinessId(dto.getExternalBusinessId());

        Business saved = businessRepository.save(business);
        return BusinessDTO.fromEntity(saved);
    }

    /**
     * Cambiar el propietario de un negocio
     */
    public BusinessDTO changeBusinessOwner(Long businessId, Long newOwnerId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("Negocio no encontrado"));

        User newOwner = userRepository.findById(newOwnerId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (newOwner.getRole().getName() != RolName.ADMINISTRADOR) {
            throw new IllegalArgumentException("El nuevo propietario debe tener rol ADMINISTRADOR");
        }

        business.setOwner(newOwner);
        Business updated = businessRepository.save(business);
        return BusinessDTO.fromEntity(updated);
    }

    /**
     * Eliminar una asignación de negocio
     */
    public void removeBusinessAssignment(Long businessId) {
        if (!businessRepository.existsById(businessId)) {
            throw new IllegalArgumentException("Negocio no encontrado");
        }
        businessRepository.deleteById(businessId);
    }
}
