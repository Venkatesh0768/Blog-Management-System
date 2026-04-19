package org.blog.backend.repository;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.blog.backend.model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByEmail(@Email(message = "Invalid Email Format") @NotBlank(message = "Email is required") String email);

    boolean existsByUsername(String username);

    @EntityGraph(attributePaths = {"role"})
    Optional<User> findById(UUID id);

    @EntityGraph(attributePaths = {"role"})
    List<User> findAll();
}
