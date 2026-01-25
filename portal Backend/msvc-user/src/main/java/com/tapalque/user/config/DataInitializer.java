package com.tapalque.user.config;

import java.time.LocalDateTime;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.tapalque.user.entity.Role;
import com.tapalque.user.entity.User;
import com.tapalque.user.enu.RolName;
import com.tapalque.user.repository.RoleRepository;
import com.tapalque.user.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${moderator.email:go@tapalque.com}")
    private String moderatorEmail;

    @Value("${moderator.password:T4p4lqu3!}")
    private String moderatorPassword;

    @Value("${moderator.name:Moderador Tapalque}")
    private String moderatorName;

    @Override
    public void run(String... args) throws Exception {
        initRoles();
        initModeratorUser();
    }

    private void initRoles() {
        for (RolName rolName : RolName.values()) {
            if (roleRepository.findByName(rolName).isEmpty()) {
                Role role = new Role();
                role.setName(rolName);
                roleRepository.save(role);
                logger.info("Rol creado: {}", rolName);
            }
        }
    }

    private void initModeratorUser() {
        Optional<User> existingUser = userRepository.findByEmail(moderatorEmail);

        if (existingUser.isEmpty()) {
            Optional<Role> moderadorRole = roleRepository.findByName(RolName.MODERADOR);

            if (moderadorRole.isPresent()) {
                User moderator = new User();
                moderator.setEmail(moderatorEmail);
                moderator.setPassword(passwordEncoder.encode(moderatorPassword));
                moderator.setFirstName(moderatorName);
                moderator.setEmailVerified(true);
                moderator.setActivo(true);
                moderator.setRole(moderadorRole.get());
                moderator.setRegistrationDate(LocalDateTime.now());

                userRepository.save(moderator);
                logger.info("Usuario moderador creado: {}", moderatorEmail);
            } else {
                logger.error("No se pudo crear el moderador: rol MODERADOR no encontrado");
            }
        } else {
            logger.info("Usuario moderador ya existe: {}", moderatorEmail);
        }
    }
}
