package org.blog.backend.services.impl;

import lombok.RequiredArgsConstructor;
import org.blog.backend.dto.commentsDto.commentRequestDtos.CreateCommentRequestDto;
import org.blog.backend.dto.commentsDto.commentResponseDtos.CommentResponseDto;
import org.blog.backend.exception.PostNotFoundException;
import org.blog.backend.exception.UserNotFoundException;
import org.blog.backend.model.Comment;
import org.blog.backend.model.Post;
import org.blog.backend.model.User;
import org.blog.backend.repository.CommentRepository;
import org.blog.backend.repository.PostRepository;
import org.blog.backend.repository.UserRepository;
import org.blog.backend.services.CommentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl  implements CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    @Override
    public CommentResponseDto addComment(CreateCommentRequestDto requestDto, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Bhai isa Koi User nahi hain"));

        Post post = postRepository.findById(requestDto.getPostId())
                .orElseThrow(() -> new PostNotFoundException("Post is not Found"));

        Comment parent = null;

        if(requestDto.getParentCommentId() != null){
            parent = commentRepository.findById(requestDto.getParentCommentId())
                    .orElseThrow(()-> new RuntimeException("Parent comment not found"));
            if (!parent.getPost().getId().equals(post.getId())) {
                throw new RuntimeException("Parent comment does not belong to this post");
            }
        }

        Comment comment = Comment.builder()
                .content(requestDto.getContent())
                .user(user)
                .post(post)
                .parent(parent)
                .build();

        Comment savedComment = commentRepository.save(comment);
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponseDto> getCommentsForPost(UUID postId) {

        // Fetch top-level comments
        List<Comment> roots = commentRepository
                .findByPostIdAndParentIsNullOrderByCreatedAtDesc(postId);

        // Build nested tree
        return roots.stream()
                .map(this::buildTree)
                .toList();
    }

    // ----------- Helpers -----------

    private CommentResponseDto buildTree(Comment root) {
        // Fetch children for this node
        List<Comment> children = commentRepository.findByParentIdOrderByCreatedAtAsc(root.getId());

        List<CommentResponseDto> childDtos = children.stream()
                .map(this::buildTree)
                .toList();

        return mapToResponse(root, childDtos);
    }

    private CommentResponseDto mapToResponse(Comment c, boolean includeReplies) {
        return CommentResponseDto.builder()
                .id(c.getId())
                .content(c.getContent())
                .userId(c.getUser().getId())
                .username(c.getUser().getUsername())
                .postId(c.getPost().getId())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .createdAt(c.getCreatedAt())
                .replies(includeReplies ? new ArrayList<>() : null)
                .build();
    }

    private CommentResponseDto mapToResponse(Comment c, List<CommentResponseDto> replies) {
        return CommentResponseDto.builder()
                .id(c.getId())
                .content(c.getContent())
                .userId(c.getUser().getId())
                .username(c.getUser().getUsername())
                .postId(c.getPost().getId())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .createdAt(c.getCreatedAt())
                .replies(replies)
                .build();
    }
}
