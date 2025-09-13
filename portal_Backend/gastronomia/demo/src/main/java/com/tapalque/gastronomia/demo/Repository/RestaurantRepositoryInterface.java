package com.tapalque.gastronomia.demo.Repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.tapalque.gastronomia.demo.Entity.Restaurant;

@Repository
public interface RestaurantRepositoryInterface extends JpaRepository<Restaurant, Long> {

    @Query("SELECT r FROM Restaurant r")
    public List<Restaurant> findAllRestaurantOnly();
    
    public Optional<Restaurant> findById(long id);
    
   
    public Optional<Restaurant> findByCategory(String category);
    
    
}
