package com.tapalque.user.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tapalque.user.entity.Business;

public interface BusinessRepository extends JpaRepository<Business, Long> {
    List<Business> findByOwnerId(Long ownerId);
}
