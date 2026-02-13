package com.tapalque.gastronomia.demo.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.gastronomia.demo.Entity.RestaurantImage;

@Repository
public interface RestaurantImageRepository extends JpaRepository<RestaurantImage, Long> {
    List<RestaurantImage> findByRestaurantIdRestaurant(Long restaurantId);
    Optional<RestaurantImage> findByRestaurantIdRestaurantAndImageUrl(Long restaurantId, String imageUrl);
}
