package com.tapalque.gastronomia.demo.Repository;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.gastronomia.demo.Entity.Restaurant;

@Repository
public interface LocalRepositoryInterface extends JpaRepository<Restaurant, Long> {

    
    
}
