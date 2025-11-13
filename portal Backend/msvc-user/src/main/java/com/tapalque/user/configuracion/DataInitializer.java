package com.tapalque.user.configuracion;

import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.tapalque.user.entity.Role;
import com.tapalque.user.entity.User;
import com.tapalque.user.enu.RolName;
import com.tapalque.user.repository.RoleRepository;
import com.tapalque.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            log.info("🔄 Iniciando creación de roles...");
            
            // PRIMERO: Crear roles si no existen
            createRoleIfNotExists(RolName.ADMIN_GENERAL);
            createRoleIfNotExists(RolName.ADMIN_GASTRO);
            createRoleIfNotExists(RolName.ADMIN_HOSPEDAJE);
            createRoleIfNotExists(RolName.USER_GRAL);
            
            log.info("✅ Roles verificados/creados");

            // SEGUNDO: Crear usuario admin si no existe
            if (!userRepository.existsByEmail("admin@tapalque.com")) {
                log.info("🔄 Creando usuario admin...");
                
                // Buscar el rol ADMIN_GENERAL
                Role adminRole = roleRepository.findByName(RolName.ADMIN_GENERAL)
                    .orElseThrow(() -> new RuntimeException("Rol ADMIN_GENERAL no encontrado después de crear"));

                // Crear usuario admin
                User admin = User.builder()
                    .email("admin@tapalque.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firtName("Administrador")
                    .lastName("Sistema")
                    .nameEmprise("Tapalqué")
                    .registrationDate(LocalDateTime.now())
                    .role(adminRole)
                    .build();
                
                userRepository.save(admin);
                log.info("✅ Usuario ADMIN_GENERAL creado exitosamente");
                log.info("   Email: admin@tapalque.com");
                log.info("   Password: admin123");
            } else {
                log.info("ℹ️ Usuario admin ya existe");
            }
        };
    }

    private void createRoleIfNotExists(RolName rolName) {
        if (!roleRepository.existsByName(rolName)) {
            Role role = new Role();
            role.setName(rolName);
            roleRepository.save(role);
            log.info("✅ Rol creado: {}", rolName);
        } else {
            log.info("ℹ️ Rol ya existe: {}", rolName);
        }
    }
}