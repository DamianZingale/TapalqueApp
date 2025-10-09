package com.tapalque.gastronomia.demo.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.tapalque.gastronomia.demo.Entity.Menu;

@Repository
public interface MenuRepositoryInterface extends JpaRepository<Menu, Long> {
    //Optional<Menu> findByRestaurantIdRestaurant(Long idRestaurant);

    @Query("SELECT m FROM Menu m LEFT JOIN FETCH m.dishes WHERE m.restaurant.idRestaurant = :idRestaurant")
    Optional<Menu> findByRestaurantIdRestaurant(Long idRestaurant);

}
