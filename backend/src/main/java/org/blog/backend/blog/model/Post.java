package org.blog.backend.blog.model;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.blog.backend.auth.model.User;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "posts" , indexes = {
        @Index(name = "idx_post_slug" , columnList = "slug")
})
public class Post extends BaseModel{

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String content;

    @Column(unique = true, nullable = false)
    private String slug;

    @Column(name = "post_status" , nullable = false)
    @Enumerated(EnumType.STRING)
    private PostStatus postStatus;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "post" , cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<PostImages> images;

    @OneToMany(mappedBy = "post" , cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;
}
