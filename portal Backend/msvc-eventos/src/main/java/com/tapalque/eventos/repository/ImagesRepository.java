package com.tapalque.eventos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tapalque.eventos.entity.EventImages;

public interface ImagesRepository extends JpaRepository<EventImages, Long> {

}
