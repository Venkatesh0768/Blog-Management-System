package org.blog.backend.blog.repository;

import org.blog.backend.blog.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
@Repository
public interface CommentRepository extends JpaRepository<Comment , UUID> {

    List<Comment> findByPostIdAndParentIsNullOrderByCreatedAtDesc(UUID postId);
    List<Comment> findByParentIdOrderByCreatedAtAsc(UUID parentId);
}
