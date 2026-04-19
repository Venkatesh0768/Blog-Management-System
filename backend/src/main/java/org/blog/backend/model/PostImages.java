package org.blog.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "post_images", indexes = {
        @Index(name = "idx_post_image_post", columnList = "post_id")
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostImages extends  BaseModel {

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;
}
