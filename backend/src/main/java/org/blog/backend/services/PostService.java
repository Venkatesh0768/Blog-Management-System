package org.blog.backend.services;

import org.blog.backend.dto.PostDtos.PostRequestDtos.CreatePostRequestDto;
import org.blog.backend.dto.PostDtos.PostRequestDtos.UpdatePostRequestDto;
import org.blog.backend.dto.PostDtos.PostResponseDtos.PostResponseDto;

import java.util.List;
import java.util.UUID;

public interface PostService {
    PostResponseDto createPost(CreatePostRequestDto requestDto , UUID uuid);

    List<PostResponseDto> getAllPost();

    List<PostResponseDto> getPostsOfUser(UUID id);

    PostResponseDto getPostById(UUID id);

    PostResponseDto updatePost(UpdatePostRequestDto requestDto, UUID uuid);

    void deletePost(UUID postId);

}
