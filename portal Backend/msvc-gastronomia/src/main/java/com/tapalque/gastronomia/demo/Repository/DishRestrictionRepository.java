package com.tapalque.gastronomia.demo.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.gastronomia.demo.Entity.DishRestriction;

@Repository
public interface DishRestrictionRepository extends JpaRepository<DishRestriction, Long> {
    Optional<DishRestriction> findByName(String name);
}
