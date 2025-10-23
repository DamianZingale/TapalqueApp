package com.tapalque.msvc_pedidos.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

import com.tapalque.msvc_pedidos.entity.Order;

public interface  OrderRepository extends ReactiveMongoRepository<Order, String> {

    

}
