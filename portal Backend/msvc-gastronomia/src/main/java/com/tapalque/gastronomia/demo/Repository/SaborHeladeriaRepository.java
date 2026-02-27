package com.tapalque.gastronomia.demo.Repository;

import com.tapalque.gastronomia.demo.Entity.SaborHeladeria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SaborHeladeriaRepository extends JpaRepository<SaborHeladeria, Long> {
    List<SaborHeladeria> findByRestauranteIdRestaurant(Long restaurantId);
    List<SaborHeladeria> findByRestauranteIdRestaurantAndHabilitado(Long restaurantId, Boolean habilitado);
}
