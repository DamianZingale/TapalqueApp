package com.tapalque.gastronomia.demo;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.tapalque.gastronomia.demo")
@EnableJpaRepositories(basePackages = "com.tapalque.gastronomia.demo.Repository")
@EntityScan(basePackages = "com.tapalque.gastronomia.demo.Entity")
public class GastronomiaApplication {

	public static void main(String[] args) {
		SpringApplication.run(GastronomiaApplication.class, args);
	}

}
