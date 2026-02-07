package com.tapalque.gastronomia.demo.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.gastronomia.demo.Entity.Dish;

@Repository
public interface DishRepository extends JpaRepository<Dish, Long> {

    /**
     * Encuentra todos los platos de un menú específico
     */
    List<Dish> findByMenu_IdMenu(Long menuId);

    /**
     * Encuentra un plato por ID y menú
     */
    Optional<Dish> findByIdDishAndMenu_IdMenu(Long dishId, Long menuId);

    /**
     * Elimina todos los platos de un menú
     */
    void deleteByMenu_IdMenu(Long menuId);
}
