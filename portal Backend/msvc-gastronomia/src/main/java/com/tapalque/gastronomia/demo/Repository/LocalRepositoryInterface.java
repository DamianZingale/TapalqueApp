package com.tapalque.gastronomia.demo.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.tapalque.gastronomia.demo.DTO.RestaurantDTO;
import com.tapalque.gastronomia.demo.Entity.Restaurant;

@Repository
public interface LocalRepositoryInterface extends JpaRepository<Restaurant, Long> {

    // 🔹 Traer todos los restaurantes ACTIVOS (vista pública)
    @Query(value = """
        SELECT
            r.id_restaurant AS idRestaurant,
            r.name,
            r.address,
            r.email,
            r.latitude AS latitude,
            r.longitude AS longitude,
            GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS categories,
            GROUP_CONCAT(DISTINCT p.number SEPARATOR ', ') AS phones,
            GROUP_CONCAT(DISTINCT CONCAT(s.day_of_week, ':', s.opening_time, '-', s.closing_time) SEPARATOR '; ') AS schedule,
            r.delivery,
            r.delivery_price AS deliveryPrice,
            r.estimated_wait_time AS estimatedWaitTime,
            r.es_heladeria AS esHeladeria,
            r.activo AS activo,
            (SELECT ri.photo
             FROM restaurant_images ri
             WHERE ri.restaurant_id = r.id_restaurant
             LIMIT 1) AS imageUrl
        FROM restaurant r
        LEFT JOIN restaurant_category rc ON rc.id_restaurant = r.id_restaurant
        LEFT JOIN category c ON c.id_category = rc.id_category
        LEFT JOIN phone_number p ON p.id_restaurant = r.id_restaurant
        LEFT JOIN schedule s ON s.id_restaurant = r.id_restaurant
        WHERE r.activo = true
        GROUP BY r.id_restaurant, r.name, r.address, r.email,
                 r.latitude, r.longitude, r.delivery, r.delivery_price, r.estimated_wait_time, r.es_heladeria, r.activo
        ORDER BY r.id_restaurant
        """, nativeQuery = true)
    List<RestaurantDTO> selectAllRestaurant();

    // 🔹 Traer TODOS los restaurantes sin filtro (panel moderador)
    @Query(value = """
        SELECT
            r.id_restaurant AS idRestaurant,
            r.name,
            r.address,
            r.email,
            r.latitude AS latitude,
            r.longitude AS longitude,
            GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS categories,
            GROUP_CONCAT(DISTINCT p.number SEPARATOR ', ') AS phones,
            GROUP_CONCAT(DISTINCT CONCAT(s.day_of_week, ':', s.opening_time, '-', s.closing_time) SEPARATOR '; ') AS schedule,
            r.delivery,
            r.delivery_price AS deliveryPrice,
            r.estimated_wait_time AS estimatedWaitTime,
            r.es_heladeria AS esHeladeria,
            r.activo AS activo,
            (SELECT ri.photo
             FROM restaurant_images ri
             WHERE ri.restaurant_id = r.id_restaurant
             LIMIT 1) AS imageUrl
        FROM restaurant r
        LEFT JOIN restaurant_category rc ON rc.id_restaurant = r.id_restaurant
        LEFT JOIN category c ON c.id_category = rc.id_category
        LEFT JOIN phone_number p ON p.id_restaurant = r.id_restaurant
        LEFT JOIN schedule s ON s.id_restaurant = r.id_restaurant
        GROUP BY r.id_restaurant, r.name, r.address, r.email,
                 r.latitude, r.longitude, r.delivery, r.delivery_price, r.estimated_wait_time, r.es_heladeria, r.activo
        ORDER BY r.id_restaurant
        """, nativeQuery = true)
    List<RestaurantDTO> selectAllRestaurantAdmin();

    // 🔹 Traer un restaurante por ID (sin filtro de activo, accesible siempre)
    @Query(value = """
        SELECT
            r.id_restaurant AS idRestaurant,
            r.name,
            r.address,
            r.email,
            r.latitude AS latitude,
            r.longitude AS longitude,
            GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS categories,
            GROUP_CONCAT(DISTINCT p.number SEPARATOR ', ') AS phones,
            GROUP_CONCAT(DISTINCT CONCAT(s.day_of_week, ':', s.opening_time, '-', s.closing_time) SEPARATOR '; ') AS schedule,
            r.delivery,
            r.delivery_price AS deliveryPrice,
            r.estimated_wait_time AS estimatedWaitTime,
            r.es_heladeria AS esHeladeria,
            r.activo AS activo,
            (SELECT ri.photo
             FROM restaurant_images ri
             WHERE ri.restaurant_id = r.id_restaurant
             LIMIT 1) AS imageUrl
        FROM restaurant r
        LEFT JOIN restaurant_category rc ON rc.id_restaurant = r.id_restaurant
        LEFT JOIN category c ON c.id_category = rc.id_category
        LEFT JOIN phone_number p ON p.id_restaurant = r.id_restaurant
        LEFT JOIN schedule s ON s.id_restaurant = r.id_restaurant
        WHERE r.id_restaurant = ?1
        GROUP BY r.id_restaurant, r.name, r.address, r.email,
                 r.latitude, r.longitude, r.delivery, r.delivery_price, r.estimated_wait_time, r.es_heladeria, r.activo
        """, nativeQuery = true)
    Optional<RestaurantDTO> selectRestaurantById(Long id);

}
