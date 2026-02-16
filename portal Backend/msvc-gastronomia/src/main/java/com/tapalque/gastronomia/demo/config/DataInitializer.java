package com.tapalque.gastronomia.demo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.tapalque.gastronomia.demo.Entity.DishCategory;
import com.tapalque.gastronomia.demo.Entity.DishRestriction;
import com.tapalque.gastronomia.demo.Repository.DishCategoryRepository;
import com.tapalque.gastronomia.demo.Repository.DishRestrictionRepository;
import com.tapalque.gastronomia.demo.enu.DishCategoryEnum;
import com.tapalque.gastronomia.demo.enu.DishRestrictionEnum;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DishRestrictionRepository restrictionRepository;
    private final DishCategoryRepository categoryRepository;

    public DataInitializer(DishRestrictionRepository restrictionRepository,
                           DishCategoryRepository categoryRepository) {
        this.restrictionRepository = restrictionRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        seedRestrictions();
        seedDishCategories();
    }

    private void seedRestrictions() {
        if (restrictionRepository.count() > 0) {
            return;
        }
        System.out.println("Inicializando restricciones alimentarias...");
        for (DishRestrictionEnum restriction : DishRestrictionEnum.values()) {
            DishRestriction entity = new DishRestriction();
            entity.setName(restriction.getDisplayName());
            restrictionRepository.save(entity);
        }
        System.out.println("Restricciones alimentarias inicializadas: " + restrictionRepository.count());
    }

    private void seedDishCategories() {
        if (categoryRepository.count() > 0) {
            return;
        }
        System.out.println("Inicializando categorías de platos...");
        for (DishCategoryEnum category : DishCategoryEnum.values()) {
            DishCategory entity = new DishCategory();
            entity.setName(category.getDisplayName());
            categoryRepository.save(entity);
        }
        System.out.println("Categorías de platos inicializadas: " + categoryRepository.count());
    }
}
