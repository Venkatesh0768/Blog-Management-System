package org.blog.backend.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "posts" , indexes = {
        @Index(name = "idx_post_slug" , columnList = "slug")
})
public class Post extends BaseModel{

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(unique = true, nullable = false)
    private String slug;

    @Column(name = "post_status" , nullable = false)
    @Enumerated(EnumType.STRING)
    private PostStatus postStatus;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "post")
    private List<Comment> comments;
}
