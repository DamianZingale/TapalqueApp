package com.tapalque.gastronomia.demo.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tapalque.gastronomia.demo.Entity.Category;

public interface CategoryRepositoriInterface extends JpaRepository<Category, Long> {
    
     Optional<Category> findByName(String name);
}
