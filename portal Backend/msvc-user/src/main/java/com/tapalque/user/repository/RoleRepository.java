package com.tapalque.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tapalque.user.entity.Role;
import com.tapalque.user.enu.RolName;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RolName name);
    boolean existsByName(RolName name);  
}
