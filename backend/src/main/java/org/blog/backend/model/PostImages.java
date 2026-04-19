package org.blog.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "post_images", indexes = {
        @Index(name = "idx_post_image_post", columnList = "post_id")
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PostImages extends  BaseModel {

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_primary")
    private Boolean isPrimary;


}
