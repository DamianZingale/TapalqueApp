package com.tapalque.gastronomia.demo.Repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tapalque.gastronomia.demo.Entity.Restaurant;



@Repository
public interface LocalRepositoryInterface extends JpaRepository<Restaurant, Long> {

    // Buscar restaurantes por categoría
    @Query("SELECT r FROM Restaurant r JOIN r.categories c WHERE c.name = :categoryName")
    List<Restaurant> findByCategoryName(@Param("categoryName") String categoryName);

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
}
    

