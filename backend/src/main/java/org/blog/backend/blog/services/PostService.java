package org.blog.backend.blog.services;

import org.blog.backend.blog.dto.PostDtos.PostRequestDtos.CreatePostRequestDto;
import org.blog.backend.blog.dto.PostDtos.PostRequestDtos.UpdatePostRequestDto;
import org.blog.backend.blog.dto.PostDtos.PostResponseDtos.PostResponseDto;

import java.util.List;
import java.util.UUID;

public interface PostService {
    PostResponseDto createPost(CreatePostRequestDto requestDto , String email);

    List<PostResponseDto> getAllPost();

    List<PostResponseDto> getPostsOfUser(String email);

    PostResponseDto getPostById(UUID id);

    PostResponseDto updatePost(UpdatePostRequestDto requestDto, UUID uuid);

    void deletePost(UUID postId);

}
