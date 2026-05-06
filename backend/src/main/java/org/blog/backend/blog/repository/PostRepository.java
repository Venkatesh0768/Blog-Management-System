package org.blog.backend.blog.repository;

import org.blog.backend.blog.model.Post;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post , UUID> {

    @EntityGraph(attributePaths = {"user"})
    List<Post> findByUserId(UUID userId);

    Page<Post> findAll(@NonNull Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    Optional<Post> findBySlug(String slug);

}
