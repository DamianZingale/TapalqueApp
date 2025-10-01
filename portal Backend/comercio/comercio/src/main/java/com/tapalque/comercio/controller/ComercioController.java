package com.tapalque.comercio.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tapalque.comercio.service.ComercioService;

@RestController
@RequestMapping("api/comercio")
public class ComercioController {
    @Autowired
    private ComercioService comercioService;
}
