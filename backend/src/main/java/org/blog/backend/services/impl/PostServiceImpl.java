package org.blog.backend.services.impl;

import lombok.RequiredArgsConstructor;
import org.blog.backend.dto.PostDtos.PostRequestDtos.CreatePostRequestDto;
import org.blog.backend.dto.PostDtos.PostRequestDtos.UpdatePostRequestDto;
import org.blog.backend.dto.PostDtos.PostResponseDtos.PostResponseDto;
import org.blog.backend.dto.commentsDto.commentResponseDtos.CommentResponseDto;
import org.blog.backend.exception.PostNotFoundException;
import org.blog.backend.exception.UserNotFoundException;
import org.blog.backend.model.Comment;
import org.blog.backend.model.Post;
import org.blog.backend.model.PostImages;
import org.blog.backend.model.User;
import org.blog.backend.repository.PostRepository;
import org.blog.backend.repository.UserRepository;
import org.blog.backend.services.PostService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;


    @Override
    public PostResponseDto createPost(CreatePostRequestDto requestDto, UUID uuid) {
        User user = userRepository.findById(uuid)
                .orElseThrow(() -> new UserNotFoundException("User Not Found By This Id"));

        Post post = Post.builder()
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .slug(generateSlug(requestDto.getTitle()))
                .postStatus(requestDto.getPostStatus())
                .user(user)
                .build();

        List<PostImages> images = new ArrayList<>();

        if (requestDto.getPrimaryImage() != null) {
            images.add(
                    PostImages.builder()
                            .post(post)
                            .isPrimary(true)
                            .imageUrl(requestDto.getPrimaryImage())
                            .build()
            );
        }

        if (requestDto.getPrimaryImage() != null) {
            for (String url : requestDto.getSecondaryImages()) {
                images.add(
                        PostImages.builder()
                                .imageUrl(url)
                                .isPrimary(false)
                                .post(post)
                                .build()
                );
            }
        }
        post.setImages(images);
        Post savedPost = postRepository.save(post);
        return mapToResponse(savedPost);
    }

    @Override
    public List<PostResponseDto> getAllPost() {
        List<Post> posts = postRepository.findAll();
        return posts.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<PostResponseDto> getPostsOfUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("User not found");
        }

        List<Post> posts = postRepository.findByUserId(id);
        return posts.stream().map(this::mapToResponse).toList();
    }

    @Override
    public PostResponseDto getPostById(UUID id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException("The post is not found by this id"));

        return mapToResponse(post);
    }

    @Override
    public PostResponseDto updatePost(UpdatePostRequestDto requestDto, UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("The post is not found"));
        if (requestDto.getTitle() != null) {
            post.setTitle(requestDto.getTitle().trim());
        }

        // 4. Update content
        if (requestDto.getContent() != null) {
            post.setContent(requestDto.getContent());
        }

//        // 5. Update slug (check uniqueness)
//        if (requestDto.getSlug() != null &&
//                !requestDto.getSlug().equals(post.getSlug())) {
//
//            if (postRepository.existsBySlug(requestDto.getSlug())) {
//                throw new RuntimeException("Slug already exists");
//            }
//
//            post.setSlug(requestDto.getSlug());
//        }


        if (requestDto.getPostStatus() != null) {
            post.setPostStatus(requestDto.getPostStatus());
        }


        Post updatedPost = postRepository.save(post);


        return mapToResponse(updatedPost);


    }

    @Override
    public void deletePost(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("The post is not found"));

        postRepository.delete(post);
    }


    private PostResponseDto mapToResponse(Post post) {

        List<UUID> commentIds = new ArrayList<>();

        if (post.getComments() != null) {
            commentIds = post.getComments().stream()
                    .filter(c -> c.getParent() == null) // optional: only top-level
                    .map(Comment::getId)
                    .toList();
        }

        // ================= IMAGES (IDs only) =================
        List<UUID> imageIds = new ArrayList<>();

        if (post.getImages() != null) {
            imageIds = post.getImages().stream()
                    .map(PostImages::getId)
                    .toList();
        }

        return PostResponseDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .slug(post.getSlug())
                .postStatus(post.getPostStatus())
                .userId(post.getUser().getId())
                .commentIds(commentIds)
                .imageIds(imageIds)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    private String generateSlug(String title) {
        return title.toLowerCase().replaceAll("[^a-z0-9]+", "-");
    }
}
