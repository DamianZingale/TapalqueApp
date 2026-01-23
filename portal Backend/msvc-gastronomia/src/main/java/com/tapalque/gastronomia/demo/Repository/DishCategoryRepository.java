package com.tapalque.gastronomia.demo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.gastronomia.demo.Entity.DishCategory;

@Repository
public interface DishCategoryRepository extends JpaRepository<DishCategory, Long> {
}
