package com.workflow.backend.config;

import com.workflow.backend.entity.Diagram;
import com.workflow.backend.entity.User;
import com.workflow.backend.repository.DiagramRepository;
import com.workflow.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    private final DiagramRepository diagramRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(DiagramRepository diagramRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.diagramRepository = diagramRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // Ensure we have at least one user
            User admin = userRepository.findByUsername("admin").orElseGet(() -> {
                User newUser = new User("admin", "admin@workflow.com", passwordEncoder.encode("admin123"));
                return userRepository.save(newUser);
            });

            if (diagramRepository.count() == 0) {
                String initialContent = "{\"nodes\":[{\"id\":\"1\",\"type\":\"input\",\"data\":{\"label\":\"Start Workflow\"},\"position\":{\"x\":250,\"y\":5}},{\"id\":\"2\",\"data\":{\"label\":\"Process Step\"},\"position\":{\"x\":100,\"y\":100}},{\"id\":\"3\",\"type\":\"output\",\"data\":{\"label\":\"End Workflow\"},\"position\":{\"x\":250,\"y\":200}}],\"edges\":[{\"id\":\"e1-2\",\"source\":\"1\",\"target\":\"2\"},{\"id\":\"e2-3\",\"source\":\"2\",\"target\":\"3\"}]}";
                diagramRepository.save(new Diagram("Default Workflow", initialContent, admin));
                System.out.println("Initialized default diagram for admin user.");
            }
        };
    }
}
