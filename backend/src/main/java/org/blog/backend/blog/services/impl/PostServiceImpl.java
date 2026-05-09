package org.blog.backend.blog.services.impl;

import lombok.RequiredArgsConstructor;
import org.blog.backend.auth.exception.EmailNotVerifiedException;
import org.blog.backend.auth.exception.UserNotFoundException;
import org.blog.backend.auth.model.User;
import org.blog.backend.auth.repository.UserRepository;
import org.blog.backend.blog.dto.PostDtos.PostRequestDtos.CreatePostRequestDto;
import org.blog.backend.blog.dto.PostDtos.PostRequestDtos.UpdatePostRequestDto;
import org.blog.backend.blog.dto.PostDtos.PostResponseDtos.PostResponseDto;
import org.blog.backend.blog.exception.EmailNotFoundException;
import org.blog.backend.blog.exception.PostNotFoundException;

import org.blog.backend.blog.model.Comment;
import org.blog.backend.blog.model.Post;
import org.blog.backend.blog.model.PostImages;
import org.blog.backend.blog.repository.PostRepository;
import org.blog.backend.blog.services.PostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.authentication.DisabledException;
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
    public PostResponseDto createPost(CreatePostRequestDto requestDto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User Not Found By This Id"));


        if(!user.isEnabled()){
            throw new DisabledException("User is not Enable");
        }

        if(!user.isEmailVerified()){
            throw new EmailNotVerifiedException("The Email Is not Verified");
        }

        String normalizedTitle = requestDto.getTitle() != null ? requestDto.getTitle().trim() : "";
        Post post = Post.builder()
                .title(normalizedTitle)
                .content(requestDto.getContent())
                .slug(generateUniqueSlug(normalizedTitle))
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

        if (requestDto.getSecondaryImages() != null) {
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
    public List<PostResponseDto> getPostsOfUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User Not Found By This Id"));

        List<Post> posts = postRepository.findByUserId(user.getId());
        return posts.stream().map(this::mapToResponse).toList();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public PostResponseDto getPostById(UUID id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException("The post is not found by this id"));

        return mapToResponse(post);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public PostResponseDto getPostBySlug(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new PostNotFoundException("The post is not found by this slug"));

        return mapToResponse(post);
    }

    @Override
    public PostResponseDto updatePost(UpdatePostRequestDto requestDto, UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("The post is not found"));
        if (requestDto.getTitle() != null) {
            post.setTitle(requestDto.getTitle().trim());
            post.setSlug(generateUniqueSlug(post.getTitle()));
        }

        // 4. Update content
        if (requestDto.getContent() != null) {
            post.setContent(requestDto.getContent());
        }

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

    @Override
    public Page<PostResponseDto> getAllLatestPosts(int page , int size , String sortBy , String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size , sort);

        Page<Post> postPage = postRepository.findAll(pageable);
        return postPage.map(this::mapToResponse);
    }




    private PostResponseDto mapToResponse(Post post) {

        List<UUID> commentIds = new ArrayList<>();

        if (post.getComments() != null) {
            commentIds = post.getComments().stream()
                    .filter(c -> c.getParent() == null) // optional: only top-level
                    .map(Comment::getId)
                    .toList();
        }

        // ================= IMAGES (URLs) =================
        List<String> imageUrls = new ArrayList<>();

        if (post.getImages() != null) {
            imageUrls = post.getImages().stream()
                    .map(PostImages::getImageUrl)
                    .toList();
        }

        return PostResponseDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .slug(post.getSlug())
                .postStatus(post.getPostStatus())
                .userId(post.getUser().getId())
                .authorName(post.getUser().getFirstName() + " " + post.getUser().getLastName())
                .commentIds(commentIds)
                .imageUrls(imageUrls)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    private String generateUniqueSlug(String title) {

        String baseSlug = title.toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        String slug = baseSlug;
        int count = 1;

        while (postRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + count;
            count++;
        }

        return slug;
    }
}
