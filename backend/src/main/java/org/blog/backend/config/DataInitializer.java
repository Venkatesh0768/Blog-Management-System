package org.blog.backend.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.blog.backend.model.Role;
import org.blog.backend.model.RoleType;
import org.blog.backend.repository.RoleRepository;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final RoleRepository repository;

    @PostConstruct
    public void init(){
        for (RoleType type : RoleType.values()) {
            repository.findByRoleType(type)
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setRoleType(type);
                        return repository.save(role);
                    });
        }
    }

}
