package com.tapalque.msvc_pedidos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableDiscoveryClient
public class MsvcPedidosApplication {

	public static void main(String[] args) {
		SpringApplication.run(MsvcPedidosApplication.class, args);
	}

}
