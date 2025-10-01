package com.tapalque.comercio.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tapalque.comercio.repository.ComercioRepository;

@Service
public class ComercioService {
    @Autowired
    private ComercioRepository comercioRepository;
}
