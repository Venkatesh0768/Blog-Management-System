package org.blog.backend.controller;


import lombok.RequiredArgsConstructor;
import org.blog.backend.dto.PostDtos.PostRequestDtos.CreatePostRequestDto;
import org.blog.backend.dto.PostDtos.PostRequestDtos.UpdatePostRequestDto;
import org.blog.backend.dto.PostDtos.PostResponseDtos.PostResponseDto;
import org.blog.backend.services.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping("/{id}/create")
    public ResponseEntity<PostResponseDto> createPost(
            @RequestBody CreatePostRequestDto requestDto,
            @PathVariable UUID id
    ) {
        return new ResponseEntity<>(postService.createPost(requestDto, id), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PostResponseDto>> getAllPosts() {
        return new ResponseEntity<>(postService.getAllPost(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<List<PostResponseDto>> getAllPosts(@PathVariable UUID id) {
        return new ResponseEntity<>(postService.getPostsOfUser(id), HttpStatus.OK);
    }

    @PatchMapping("/{postId}")
    public ResponseEntity<PostResponseDto> updatePost(@RequestBody UpdatePostRequestDto requestDto, @PathVariable UUID postId) {
        return new ResponseEntity<>(postService.updatePost(requestDto, postId), HttpStatus.OK);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable UUID postId) {
        postService.deletePost(postId);
        return ResponseEntity.noContent().build();
    }

}
