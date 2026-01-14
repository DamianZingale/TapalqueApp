package com.tapalque.termas.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tapalque.termas.entity.TermaImagen;

@Repository
public interface TermaImagenRepository extends JpaRepository<TermaImagen, Long> {
    List<TermaImagen> findByTerma_Id(Long termaId);

    int deleteByTerma_IdAndImagenUrl(Long termaId, String imagenUrl);

    Optional<TermaImagen> findByTerma_IdAndImagenUrl(Long termaId, String imagenUrl);
}
