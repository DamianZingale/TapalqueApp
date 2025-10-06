package com.tapalque.gastronomia.demo.Repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.tapalque.gastronomia.demo.Entity.Restaurant;



@Repository
public interface LocalRepositoryInterface extends JpaRepository<Restaurant, Long> {

   //seleccionar todos los locales gastronomicos con sus categorias, telefonos y horarios concatenados
    @Query(value = """
    SELECT 
        r.id_restaurant AS idRestaurant,
        r.name,
        r.address,
        r.email,
        r.map_url AS mapUrl,
        GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS categories,
        GROUP_CONCAT(DISTINCT p.number SEPARATOR ', ') AS phones,
        GROUP_CONCAT(DISTINCT CONCAT(s.day_of_week, ':', s.opening_time, '-', s.closing_time) SEPARATOR '; ') AS schedule
    FROM restaurant r
    LEFT JOIN restaurant_category rc ON rc.id_restaurant = r.id_restaurant
    LEFT JOIN category c ON c.id_category = rc.id_category
    LEFT JOIN phone_number p ON p.id_restaurant = r.id_restaurant
    LEFT JOIN schedule s ON s.id_restaurant = r.id_restaurant
    GROUP BY r.id_restaurant, r.name, r.address, r.email, r.map_url
    ORDER BY r.id_restaurant
    """, nativeQuery = true)
List<Object[]> selectAllRestaurant();

//seleccionar restaurant por id con sus categorias, telefonos y horarios concatenados
    @Query(value = """
    SELECT 
        r.id_restaurant AS idRestaurant,
        r.name,
        r.address,
        r.email,
        r.map_url AS mapUrl,
        GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS categories,
        GROUP_CONCAT(DISTINCT p.number SEPARATOR ', ') AS phones,
        GROUP_CONCAT(DISTINCT CONCAT(s.day_of_week, ':', s.opening_time, '-', s.closing_time) SEPARATOR '; ') AS schedule
    FROM restaurant r
    LEFT JOIN restaurant_category rc ON rc.id_restaurant = r.id_restaurant
    LEFT JOIN category c ON c.id_category = rc.id_category
    LEFT JOIN phone_number p ON p.id_restaurant = r.id_restaurant
    LEFT JOIN schedule s ON s.id_restaurant = r.id_restaurant
    WHERE r.id_restaurant = ?1
    GROUP BY r.id_restaurant, r.name, r.address, r.email, r.map_url
    """, nativeQuery = true)
    Object selectRestaurantById(Long id);

}
    

