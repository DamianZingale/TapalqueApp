package com.tapalque.user.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tapalque.user.entity.Business;
import com.tapalque.user.enu.BusinessType;

public interface BusinessRepository extends JpaRepository<Business, Long> {
    List<Business> findByOwnerId(Long ownerId);
    boolean existsByOwnerIdAndBusinessTypeAndExternalBusinessId(Long ownerId, BusinessType businessType, Long externalBusinessId);
}
