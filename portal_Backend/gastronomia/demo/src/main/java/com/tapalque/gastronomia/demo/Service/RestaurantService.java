package com.tapalque.gastronomia.demo.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tapalque.gastronomia.demo.Entity.Restaurant;
import com.tapalque.gastronomia.demo.Repository.LocalRepositoryInterface;

import jakarta.persistence.EntityNotFoundException;

@Service
public class RestaurantService implements I_RestaurantService {

    @Autowired
    private LocalRepositoryInterface localGastronomicoRepository;

    @Override
    public void addLocalGastronomico(Restaurant localGastronomico) {
        if (localGastronomico.getName() == null || localGastronomico
        .getName().isBlank()) {
            throw new IllegalArgumentException("El nombre del local no puede estar vacío");
        }
        localGastronomicoRepository.save(localGastronomico);
    }

    @Override
    public Restaurant getLocalGastronomicoById(Long id) {
        return localGastronomicoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el local con id " + id));
    }

    @Override
    public List<Restaurant> getAllLocalGastronomicos() {
        List<Restaurant> locales = localGastronomicoRepository.findAll();
        if (locales.isEmpty()) {
            throw new EntityNotFoundException("No hay locales gastronómicos registrados");
        }
        return locales;
    }

    @Override
    public void updateLocalGastronomico(Restaurant localGastronomico) {
        if (!localGastronomicoRepository.existsById(localGastronomico.getIdRestaurant())) {
            throw new EntityNotFoundException("No existe el local con id " + localGastronomico.getIdRestaurant());
        }
        localGastronomicoRepository.save(localGastronomico);
    }

    @Override
    public void deleteLocalGastronomico(int id) {
        Long idLong = (long) id;
        if (!localGastronomicoRepository.existsById(idLong)) {
            throw new EntityNotFoundException("No se puede eliminar, no existe el local con id " + id);
        }
        localGastronomicoRepository.deleteById(idLong);
    }
    /*@Override
    public List<LocalGastronomico> findByRubro(String rubro) {
        return localGastronomicoRepository.findByRubros(rubro);
    }*/

    @Override
    public List<Restaurant> findBycategory(String category) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'findBycategory'");
    }
    
   

   

    
}


