package com.tapalque.user.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.user.entity.HomeConfig;
import com.tapalque.user.enu.SectionType;

@Repository
public interface HomeConfigRepository extends JpaRepository<HomeConfig, Long> {

    Optional<HomeConfig> findBySeccion(SectionType seccion);

    List<HomeConfig> findByActivoTrue();
}
